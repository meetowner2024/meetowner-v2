import { cookies } from "next/headers";
import dynamic from "next/dynamic";
import config from "@/components/utils/config";
const ProfilePage = dynamic(() => import("../../components/utils/Profile"));
const Header = dynamic(() => import("../../components/Header"), { ssr: true });
const Footer = dynamic(() => import("../../components/Footer"), { ssr: true });
export default async function ProfileWrapper() {
  const cookieStore = await cookies();
  const user = cookieStore.get("user")?.value;
  let userData = null;
  let userId = null;

  try {
    if (user) {
      userData = JSON.parse(user);
      userId = userData?.user_details?.id || null;
    }
  } catch (err) {
    console.error("Invalid user cookie:", err);
  }
  if (!userId) {
    return <div>User not found — please login again.</div>;
  }
  const res = await fetch(
    `${config.awsApiUrl}/user/v1/getProfile?user_id=${userId}`,
    {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
  const profile = await res.json();
  return (
    <>
      <Header />
      <ProfilePage serverProfile={profile} />
      <Footer />
    </>
  );
}
