'use client';
import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import { FormErrorMessage } from '@/shared/components/ui/form-error-message';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { StandardDialogContent } from '@/shared/components/ui/standard-dialog-content';

type DeleteConfirmationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: ReactNode;
  description?: ReactNode;
  itemLabel?: ReactNode;
  itemValue?: ReactNode;
  confirmWord?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isConfirming?: boolean;
  confirmDisabled?: boolean;
  confirmDisabledMessage?: ReactNode;
  children?: ReactNode;
};

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title = 'Excluir registro',
  description = 'Esta ação remove o registro selecionado de forma permanente.',
  itemLabel,
  itemValue,
  confirmWord = 'excluir',
  confirmLabel = 'Excluir',
  cancelLabel = 'Cancelar',
  isConfirming = false,
  confirmDisabled = false,
  confirmDisabledMessage,
  children,
}: DeleteConfirmationDialogProps) {
  const [confirmationText, setConfirmationText] = useState('');
  const confirmationInputId = useId();
  const normalizedConfirmation = confirmationText.trim().toLowerCase();
  const normalizedWord = confirmWord.trim().toLowerCase();
  const isWordConfirmed = normalizedConfirmation === normalizedWord;
  const canConfirm = isWordConfirmed && !confirmDisabled && !isConfirming;

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setConfirmationText('');
    }

    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <StandardDialogContent
        title={title}
        description={description}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => handleOpenChange(false)}>
              {cancelLabel}
            </Button>
            <Button
              type="button"
              className="bg-red-600 text-white hover:bg-red-500 disabled:bg-red-900/70 disabled:text-red-200"
              onClick={onConfirm}
              disabled={!canConfirm}
            >
              {isConfirming ? 'Excluindo...' : confirmLabel}
            </Button>
          </>
        }
      >
        {itemLabel && itemValue ? (
          <p className="text-sm text-muted-foreground">
            {itemLabel}: <span className="font-medium">{itemValue}</span>
          </p>
        ) : null}

        {children}

        <div className="space-y-2">
          <Label htmlFor={confirmationInputId}>
            Digite <span className="font-bold">{confirmWord}</span> para confirmar
          </Label>
          <Input
            id={confirmationInputId}
            value={confirmationText}
            autoComplete="off"
            onChange={(event) => setConfirmationText(event.target.value)}
          />
        </div>

        {confirmDisabledMessage ? <FormErrorMessage size="sm">{confirmDisabledMessage}</FormErrorMessage> : null}
      </StandardDialogContent>
    </Dialog>
  );
}
