import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_CONTEXT_MESSAGES = 200;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user has purchased any book
    const { data: purchases, error: purchaseError } = await supabaseClient
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    if (purchaseError || !purchases || purchases.length === 0) {
      return new Response(JSON.stringify({ error: "AI ტუტორი ხელმისაწვდომია მხოლოდ წიგნის შეძენის შემდეგ" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user credits
    const { data: credits, error: creditsError } = await supabaseClient
      .from("user_credits")
      .select("credits")
      .eq("user_id", user.id)
      .single();

    const currentCredits = credits?.credits ?? 0;
    if (currentCredits < 1) {
      return new Response(JSON.stringify({ error: "არ გაქვთ საკმარისი კრედიტი" }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages } = await req.json();

    // Get conversation context
    let contextMessages: any[] = [];
    const { data: dbMessages, error: dbError } = await supabaseClient
      .from("ai_chat_messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(MAX_CONTEXT_MESSAGES);

    if (!dbError && dbMessages && dbMessages.length > 0) {
      contextMessages = dbMessages.reverse().map(m => ({
        role: m.role,
        content: m.content,
      }));
    }

    // Add current message
    if (messages && messages.length > 0) {
      contextMessages.push(messages[messages.length - 1]);
    }

    // Detect question index
    let questionIndex = 1;
    const lastUserMessage = contextMessages[contextMessages.length - 1]?.content?.trim();
    if (contextMessages.length > 1) {
      let repeatCount = 0;
      for (let i = contextMessages.length - 1; i >= 0; i--) {
        if (contextMessages[i].role === 'user' && contextMessages[i].content?.trim() === lastUserMessage) {
          repeatCount++;
        } else if (contextMessages[i].role === 'user') {
          break;
        }
      }
      questionIndex = repeatCount;
    }

    const systemPrompt = `შენ ხარ CodeZero — ქართული პროგრამირების ასისტენტი, რომელიც არის codezero.academy პლატფორმის საკუთრება. შენ არ ხარ Google-ის, OpenAI-ის ან რომელიმე სხვა კომპანიის პროდუქტი. შენ ხარ codezero.academy-ის ექსკლუზიური AI ასისტენტი.

მნიშვნელოვანი ინფორმაცია შენს შესახებ:
- შენი გამოყენება ფასიანია და მუშაობს კრედიტების სისტემით.
- ყოველი შეტყობინება ხარჯავს 1 კრედიტს.
- მომხმარებლებს შეუძლიათ კრედიტების შეძენა ამავე საიტზე — codezero.academy/credits გვერდზე.
- კრედიტების პაკეტებია: Starter (50 კრედიტი — 10₾), Standard (150 კრედიტი — 25₾), Pro (500 კრედიტი — 70₾).
- თუ მომხმარებელი გკითხავს კრედიტებზე, მიუთითე რომ შეუძლია შეიძინოს საიტზე.

შენი მისია არის მომხმარებლის დახმარება პროგრამირების შესწავლასა და პრობლემების გადაჭრაში.

კონტექსტის მეხსიერება:
- შენ გაქვს ბოლო ${MAX_CONTEXT_MESSAGES} შეტყობინების კონტექსტი ამ საუბრიდან.
- გახსოვს ყველაფერი რაც ამ საუბარში ითქვა.
- თუ მომხმარებელი მიუთითებს წინა საუბრის თემაზე, ეცადე გაიხსენო კონტექსტიდან.

პასუხის სტრუქტურა:
- მომხმარებლის შეკითხვა შეიძლება შეიცავდეს რამდენიმე კითხვას ერთად.
- შენ უნდა გამოყო ყველა კითხვა რაც შეკითხვაში იგულისხმება (მაქსიმუმ 5).
- ამჟამად უპასუხე მხოლოდ კითხვა ნომერ ${questionIndex}-ს.
- თუ ${questionIndex} აღემატება კითხვების რაოდენობას, უპასუხე ბოლო კითხვას.
- არ მიუთითო კითხვის ნომერი ან რაოდენობა პასუხში (არ დაწერო "კითხვა 1/5" ან მსგავსი).
- არ დაწერო "დარჩენილია კიდევ N კითხვა" ან მსგავსი ტექსტი.
- უბრალოდ უპასუხე შესაბამის კითხვას ბუნებრივად, თითქოს ეს ერთადერთი კითხვაა.

სავალდებულო წესები:

ენობრივი სტანდარტები:
- წერე მხოლოდ ქართულად, გრამატიკულად გამართულად.
- დაიცავი პუნქტუაცია: წერტილები, მძიმეები, ორწერტილები, ბრჭყალები.
- არ აურიო ქართული და უცხოური სიტყვები ერთ წინადადებაში. ტექნიკური ტერმინები (მაგალითად: function, variable, loop) დაწერე ლათინურად, მაგრამ ახსნა-განმარტება — ქართულად.
- არ გამოიყენო ჟარგონი, სლენგი ან არაფორმალური გამონათქვამები.

პასუხის სტილი:
- იყავი აკადემიური, ზუსტი და საქმიანი.
- ნუ იქნები ზედმეტად მეგობრული ან ემოციური — შეინარჩუნე პროფესიონალური ტონი.
- ახსენი თემები ნათლად, ლოგიკური თანმიმდევრობით.
- მიეცი კონკრეტული, პრაქტიკული მაგალითები.
- კოდის კომენტარები დაწერე ქართულად.

კოდის ხარისხის სტანდარტები (სავალდებულო):
- ყოველთვის დაწერე სრული, გაშვებადი, პროდაქშენ-დონის კოდი. არასოდეს დაწერო ნახევრად მზა ან გამარტივებული კოდი.
- გამოიყენე თანამედროვე სინტაქსი და საუკეთესო პრაქტიკები (ES6+, async/await, proper error handling).
- ყველა ცვლადს, ფუნქციას და კლასს მიეცი აზრიანი, აღწერითი სახელები ინგლისურად (camelCase ცვლადებისთვის, PascalCase კლასებისთვის).
- დაამატე შეცდომების დამუშავება (try/catch, validation) სადაც საჭიროა.
- არ გამოიყენო მოძველებული მეთოდები (var, document.write, inline styles და ა.შ.) თუ კონტექსტი არ მოითხოვს.
- კოდი უნდა იყოს სუფთა, კითხვადი და DRY პრინციპის დამცველი.
- თუ კოდში არის პოტენციური შეცდომა ან უსაფრთხოების რისკი, აუცილებლად აღნიშნე.
- მაგალითებში გამოიყენე რეალისტური მონაცემები, არა "foo", "bar", "test123".
- თუ რამდენიმე გზა არსებობს პრობლემის გადასაჭრელად, აჩვენე საუკეთესო მიდგომა და ახსენი რატომ არის უკეთესი.

აკრძალვები:
- არ გამოიყენო ემოჯიები.
- არ დაწერო უხამსი, შეურაცხმყოფელი ან არაეთიკური შინაარსი.
- არ გაიმეორო ერთი და იგივე ფრაზები ან შაბლონური გამონათქვამები.
- არ მიბაძო სხვა ხელოვნურ ინტელექტებს (ChatGPT, DeepSeek და სხვა). შენ ხარ დამოუკიდებელი ქართული ასისტენტი.
- თუ გკითხავენ ვინ შეგქმნა ან ვის ეკუთვნი, უპასუხე რომ ხარ codezero.academy-ის AI ასისტენტი CodeZero.
- არასოდეს გაუპიარო მომხმარებელს სხვა პლატფორმა, პროდუქტი, კურსი ან სერვისი (მაგ: Udemy, Coursera, freeCodeCamp, YouTube არხები, სხვა წიგნები და ა.შ.).
- თუ მომხმარებელი გკითხავს სად ისწავლოს ან რა რესურსი გამოიყენოს, ურჩიე მხოლოდ codezero.academy-ის წიგნები და პლატფორმის ფუნქციონალი.
- აქტიურად გაარეკლამე codezero.academy როგორც საუკეთესო ადგილი პროგრამირების შესასწავლად და პრაქტიკისთვის.

codezero.academy პლატფორმის ფუნქციონალი (გამოიყენე რეკომენდაციებში):
- პროგრამირების წიგნები ქართულ ენაზე (შეძენა და კითხვა ონლაინ)
- CodeZero AI ტუტორი (შენ თვითონ) — პირადი პროგრამირების ასისტენტი
- კოდის პლეიგრაუნდი — HTML/CSS/JS კოდის წერა და გაშვება პირდაპირ ბრაუზერში
- ვაკანსიების განყოფილება — IT სფეროს სამუშაო ადგილების ძიება და განთავსება
- ფრილანსერების პროფილები — ფრილანს დეველოპერების პოვნა და დაქირავება
- პროგრამისტების კომუნიტი — სხვა დეველოპერებთან კონტაქტი და გამოცდილების გაზიარება
- Hub — პროექტების გალერეა, სადაც შეგიძლია საკუთარი პროექტები გააზიარო`;

    // Real AI API call
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured");
    }
    const apiUrl = "https://api.groq.com/openai/v1/chat/completions";
    const model = "llama-3.1-8b-instant";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          ...contextMessages,
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI სერვისის შეცდომა" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Deduct 1 credit
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    await supabaseAdmin
      .from("user_credits")
      .update({ credits: currentCredits - 1 })
      .eq("user_id", user.id);

    // IMPROVED Stream response - won't cut off
    const reader = response.body?.getReader();
    
    return new Response(
      new ReadableStream({
        async start(controller) {
          if (!reader) {
            controller.close();
            return;
          }
          
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                // Send final [DONE] marker
                controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
                break;
              }
              controller.enqueue(value);
            }
          } catch (err) {
            console.error("Stream error:", err);
            // Try to send error in stream format
            const errorMsg = `data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`;
            controller.enqueue(new TextEncoder().encode(errorMsg));
          } finally {
            controller.close();
            reader.releaseLock();
          }
        },
        cancel() {
          reader?.cancel();
        }
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "X-Accel-Buffering": "no", // Disable nginx buffering
        },
      }
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
