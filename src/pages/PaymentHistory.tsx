import { Link } from "react-router-dom";
import { ArrowLeft, Receipt, BookOpen, Calendar, CreditCard } from "lucide-react";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import Container from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { usePurchases } from "@/hooks/usePurchases";
import { format } from "date-fns";
import { ka } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PaymentHistory = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { data: purchases, isLoading } = usePurchases();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Atmosphere />
        <Header />
        <Container className="py-20">
          <div className="text-center">
            <Receipt className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-4">გადახდის ისტორია</h1>
            <p className="text-muted-foreground mb-6">
              ისტორიის სანახავად გაიარეთ ავტორიზაცია
            </p>
            <Link to="/auth">
              <Button>შესვლა</Button>
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  const totalSpent = purchases?.reduce((sum, purchase) => {
    return sum + (purchase.book?.price || 0);
  }, 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      <Atmosphere />
      <Header />
      
      <Container className="py-8">
        <div className="mb-8">
          <Link to="/profile" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            პროფილი
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Receipt className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">გადახდის ისტორია</h1>
              <p className="text-muted-foreground">ყველა თქვენი ტრანზაქცია</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">შეძენილი წიგნები</p>
                <p className="text-xl font-bold">{purchases?.length || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CreditCard className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">სულ გადახდილი</p>
                <p className="text-xl font-bold">{totalSpent.toFixed(2)} ₾</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ბოლო შეძენა</p>
                <p className="text-xl font-bold">
                  {purchases && purchases.length > 0 
                    ? format(new Date(purchases[0].purchased_at), "d MMM", { locale: ka })
                    : "-"
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : purchases && purchases.length > 0 ? (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">წიგნი</TableHead>
                  <TableHead className="font-semibold">ავტორი</TableHead>
                  <TableHead className="font-semibold">თარიღი</TableHead>
                  <TableHead className="font-semibold text-right">თანხა</TableHead>
                  <TableHead className="font-semibold text-center">სტატუსი</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {purchase.book?.cover_url ? (
                          <img 
                            src={purchase.book.cover_url} 
                            alt={purchase.book.title}
                            className="w-10 h-14 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-14 bg-muted rounded flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <Link 
                            to={`/books/${purchase.book_id}`}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {purchase.book?.title || "წიგნი წაშლილია"}
                          </Link>
                          {purchase.book?.category && (
                            <p className="text-xs text-muted-foreground">
                              {purchase.book.category.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {purchase.book?.author || "-"}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{format(new Date(purchase.purchased_at), "d MMMM, yyyy", { locale: ka })}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(purchase.purchased_at), "HH:mm")}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {purchase.book?.is_free ? (
                        <span className="text-green-500">უფასო</span>
                      ) : (
                        <span>{purchase.book?.price?.toFixed(2) || "0.00"} ₾</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        წარმატებული
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 bg-card border border-border rounded-xl">
            <Receipt className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">ტრანზაქციები არ მოიძებნა</h2>
            <p className="text-muted-foreground mb-6">
              თქვენ ჯერ არ გაქვთ შეძენილი წიგნები
            </p>
            <Link to="/books">
              <Button>კატალოგის ნახვა</Button>
            </Link>
          </div>
        )}
      </Container>
    </div>
  );
};

export default PaymentHistory;
