import { useState } from 'react';
import { Check, Crown, BookOpen, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBookSubscriptions } from '@/hooks/useBookSubscriptions';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function BookSubscriptionPlans() {
  const { plans, subscription, loading } = useBookSubscriptions();
  const { addSubscription, isSubscriptionInCart } = useCart();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleAddToCart = (plan: any) => {
    addSubscription(plan);
    toast.success('საბსქრიფშენი დაემატა კალათაში');
    navigate('/cart');
  };

  const getPlanIcon = (planName: string) => {
    if (planName === 'yearly') return <Crown className="w-8 h-8 text-yellow-500" />;
    return <BookOpen className="w-8 h-8 text-blue-500" />;
  };

  const getPlanBadge = (planName: string) => {
    if (planName === 'yearly') {
      return (
        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
          40% ფასდაკლება
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
        თვიური
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">წიგნების საბსქრიფშენი</h2>
        <p className="text-muted-foreground">
          მიიღეთ წვდომა ყველა წიგნზე ერთი გადახდით
        </p>
      </div>

      {subscription && (
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">
                თქვენ გაქვთ აქტიური {subscription.plan?.display_name} საბსქრიფშენი
              </p>
              <p className="text-sm text-green-600">
                ვადა: {new Date(subscription.current_period_end).toLocaleDateString('ka-GE')}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative overflow-hidden transition-all cursor-pointer ${
              selectedPlan === plan.id
                ? 'ring-2 ring-primary shadow-lg scale-[1.02]'
                : 'hover:shadow-md'
            }`}
            onClick={() => handleSelectPlan(plan.id)}
          >
            {plan.name === 'yearly' && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-bl-full" />
            )}
            
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getPlanIcon(plan.name)}
                  <div>
                    <CardTitle className="text-xl">{plan.display_name}</CardTitle>
                    <CardDescription>
                      {plan.interval === 'month' ? 'ყოველთვიური' : 'წლიური'} გადახდა
                    </CardDescription>
                  </div>
                </div>
                {getPlanBadge(plan.name)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="text-center py-4">
                <span className="text-4xl font-bold">{plan.price_gel}₾</span>
                <span className="text-muted-foreground">/{plan.interval === 'month' ? 'თვე' : 'წელი'}</span>
              </div>
              
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>ყველა წიგნის წაკითხვა</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>AI ტუტორის წვდომა</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>გარეშე რეკლამების გარეშე</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>24/7 მხარდაჭერა</span>
                </li>
                {plan.name === 'yearly' && (
                  <li className="flex items-center gap-2 text-orange-600 font-medium">
                    <Crown className="w-4 h-4" />
                    <span>40% ფასდაკლება წლიურად</span>
                  </li>
                )}
              </ul>
            </CardContent>
            
            <CardFooter>
              <Button
                className="w-full"
                variant={selectedPlan === plan.id ? 'default' : 'outline'}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(plan);
                }}
                disabled={isSubscriptionInCart() || !!subscription}
              >
                {isSubscriptionInCart() ? (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    კალათაშია
                  </>
                ) : subscription ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    აქტიურია
                  </>
                ) : (
                  'კალათაში დამატება'
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">რას მიიღებთ?</h3>
        <ul className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
          <li>• წვდომა 100+ წიგნზე</li>
          <li>• AI ასისტენტი პროგრამირებაში</li>
          <li>• ვიდეო მასალები</li>
          <li>• პრაქტიკული სავარჯიშოები</li>
          <li>• სერტიფიკატები</li>
          <li>• ჯგუფური შეხვედრები</li>
        </ul>
      </div>
    </div>
  );
}
