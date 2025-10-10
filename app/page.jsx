import Dashboard from "../components/Dashboard";
import { cookies } from "next/headers";
export default async function Home() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user");

  let userId = null;

  if (userCookie) {
    try {
      const parsed = JSON.parse(userCookie.value);
      userId = parsed?.user_details?.user_id || null;
    } catch (err) {
      console.error("Failed to parse user cookie:", err);
    }
  }

  async function getLatestProperties() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/getLatestProperties`,
      {
        cache: "force-cache",
      }
    );

    const data = await res.json();
    return { properties: data.properties || [] };
  }

  async function getBestDealProperties() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/getBestDealProperties`,
      {
        cache: "force-cache",
      }
    );
    const encrypted = await res.json();

    return encrypted.results || [];
  }

  async function getBestMeetowner() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/getBestMeet`,
      {
        cache: "force-cache",
      }
    );
    const data = await res.json();
    return data.results || [];
  }

  async function getHighDemand() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/getHighDemand`,
      {
        cache: "force-cache",
      }
    );
    const data = await res.json();

    return data.results || [];
  }

  async function getRecommended() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/getRecommended`,
      {
        cache: "force-cache",
      }
    );
    const data = await res.json();

    return data.sellers || [];
  }

  async function getMeetExclusive() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/getMeetExclusive`,
      {
        cache: "force-cache",
      }
    );
    const data = await res.json();

    return data.results || [];
  }

  async function getAllFavourites(user_id) {
    if (!user_id) {
      return [];
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/getAllFavourites?user_id=${user_id}`
    );

    const data = await res.json();
    return data.favourites || [];
  }
  async function getAds() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/getAds?ads_page=main_slider&city=Hyderabad`,
      {
        cache: "force-cache",
      }
    );
    const data = await res.json();

    if (data.ads?.length > 0) {
      const formatted = data.ads
        .sort((a, b) => a.ads_order - b.ads_order)
        .map((item) => ({
          id: item.id,
          order: item.ads_order,
          video_url: `https://api.meetowner.in/aws/v1/s3/${item.image}`,
        }));
      return formatted || [];
    }
  }
  async function getUserContacted(userId) {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/getUserContactSellers?user_id=${userId}`
    );
    const response = await res.json();

    const contacts = response?.results || [];
    const contactIds = Array.isArray(contacts)
      ? contacts.map((contact) => contact.unique_property_id)
      : [];
    return contactIds;
  }

  const { properties } = await getLatestProperties();
  const bestDealProperties = await getBestDealProperties();
  const bestMeetownerProperties = await getBestMeetowner();
  const highDemandProperties = await getHighDemand();
  const recommendedSellers = await getRecommended();
  const meetownerExclusive = await getMeetExclusive();
  const favourites = await getAllFavourites(userId);
  const formatted = await getAds();
  const contacted = await getUserContacted(userId);

  return (
    <div>
      <Dashboard
        latestProperties={properties}
        bestDealProperties={bestDealProperties}
        bestMeetownerProperties={bestMeetownerProperties}
        highDemandProperties={highDemandProperties}
        recommendedSellers={recommendedSellers}
        meetownerExclusive={meetownerExclusive}
        favourites={favourites}
        formatted={formatted}
        contactedIds={contacted}
      />
      {/* <AdVideoPlayer /> */}
    </div>
  );
}
