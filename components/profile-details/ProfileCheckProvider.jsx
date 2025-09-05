"use client";
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
import { useProfileCheck } from "./useProfileCheck";

export default function ProfileCheckProvider({ children }) {
  const { isAlertOpen, setIsAlertOpen, handleUpdateProfile, handleCancel } =
    useProfileCheck();

  return (
    <>
      {children}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="max-w-md mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Update Your Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Your profile is incomplete. Please update your profile details to
              continue using the platform without disruption.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateProfile}>
              Update Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
