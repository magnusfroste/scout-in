import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CreditCard, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreditPackage {
  credits: number;
  price: number;
  priceId: string;
  popular?: boolean;
}

const CREDIT_PACKAGES: CreditPackage[] = [
  {
    credits: 5,
    price: 5,
    priceId: 'price_1RGoUuHTXSpIB5InGhmQ7gdn',
  },
  {
    credits: 25,
    price: 25,
    priceId: 'price_1RGobkHTXSpIB5Iny2gg7sQv',
    popular: true,
  },
];

interface CreditPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCredits: number;
}

export const CreditPurchaseDialog = ({
  open,
  onOpenChange,
  currentCredits,
}: CreditPurchaseDialogProps) => {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePurchase = async (pkg: CreditPackage) => {
    try {
      setLoading(pkg.priceId);

      const { data, error } = await supabase.functions.invoke('lab-create-checkout-session', {
        body: {
          priceId: pkg.priceId,
          credits: pkg.credits,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Buy Credits</DialogTitle>
          <DialogDescription>
            Current balance: {currentCredits} credits
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {CREDIT_PACKAGES.map((pkg) => (
            <Card
              key={pkg.priceId}
              className={`p-6 relative ${
                pkg.popular ? 'border-primary shadow-lg' : ''
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                  Popular
                </div>
              )}

              <div className="text-center space-y-4">
                <div>
                  <div className="text-3xl font-bold">{pkg.credits}</div>
                  <div className="text-sm text-muted-foreground">Credits</div>
                </div>

                <div>
                  <div className="text-2xl font-bold">€{pkg.price}</div>
                  <div className="text-xs text-muted-foreground">
                    €{(pkg.price / pkg.credits).toFixed(2)} per credit
                  </div>
                </div>

                <Button
                  onClick={() => handlePurchase(pkg)}
                  disabled={loading !== null}
                  className="w-full"
                  variant={pkg.popular ? "default" : "outline"}
                >
                  {loading === pkg.priceId ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Buy Now
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-xs text-center text-muted-foreground mt-4">
          Secure payment powered by Stripe
        </div>
      </DialogContent>
    </Dialog>
  );
};
