import { useUIStore } from '@/store';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/use-media-query';
import { AuthForm } from '@/components/auth/AuthForm';

export function AuthModal() {
  const { isAuthModalOpen, setAuthModalOpen } = useUIStore();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={isAuthModalOpen} onOpenChange={setAuthModalOpen}>
        <DialogContent className="sm:max-w-[425px] p-6">
          <AuthForm onSuccess={() => setAuthModalOpen(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isAuthModalOpen} onOpenChange={setAuthModalOpen}>
      <DrawerContent>
        <div className="px-4 pb-8 pt-4">
          <div className="mx-auto w-full max-w-sm">
            <AuthForm onSuccess={() => setAuthModalOpen(false)} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

