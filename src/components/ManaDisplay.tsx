import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface ManaDisplayProps {
  manaValue: number;
  onSell: () => void;
  cardTitle: string;
}

export const ManaDisplay = ({ manaValue, onSell, cardTitle }: ManaDisplayProps) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  return (
    <>
      <Button
        onClick={() => setShowConfirmDialog(true)}
        className="absolute top-2 left-2 z-30 bg-black/20 backdrop-blur-sm hover:bg-black/30 text-white border-none flex items-center gap-2 transition-all duration-300"
      >
        <img 
          src="/lovable-uploads/75d6637e-1062-4fd8-b272-34dbb7e63acc.png" 
          alt="Mana" 
          className="w-5 h-5 object-contain"
        />
        {manaValue}
      </Button>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Sale</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sell {cardTitle}? You will receive {manaValue} mana.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onSell();
                setShowConfirmDialog(false);
              }}
            >
              Confirm Sale
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};