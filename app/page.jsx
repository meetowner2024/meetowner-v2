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
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/getLatestProperties`,
        {
          cache: "force-cache",
        }
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      return { properties: data.properties || [] };
    } catch (error) {
      console.error("getLatestProperties Error:", error.message);
      return { properties: [] };
    }
  }
  async function getBestDealProperties() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/getBestDealProperties`,
        {
          cache: "force-cache",
        }
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const encrypted = await res.json();
      return encrypted.results || [];
    } catch (error) {
      console.error("getBestDealProperties Error:", error.message);
      return [];
    }
  }
  async function getBestMeetowner() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/getBestMeet`,
        {
          cache: "force-cache",
        }
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      return data.results || [];
    } catch (error) {
      console.error("getBestMeetowner Error:", error.message);
      return [];
    }
  }
  async function getHighDemand() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/getHighDemand`,
        {
          cache: "force-cache",
        }
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      return data.results || [];
    } catch (error) {
      console.error("getHighDemand Error:", error.message);
      return [];
    }
  }
  async function getRecommended() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/getRecommended`,
        {
          cache: "force-cache",
        }
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      return data.sellers || [];
    } catch (error) {
      console.error("getRecommended Error:", error.message);
      return [];
    }
  }
  async function getMeetExclusive() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/getMeetExclusive`,
        {
          cache: "force-cache",
        }
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      return data.results || [];
    } catch (error) {
      console.error("getMeetExclusive Error:", error.message);
      return [];
    }
  }
  async function getAllFavourites(user_id) {
    if (!user_id) {
      return [];
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/getAllFavourites?user_id=${user_id}`
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      return data.favourites || [];
    } catch (error) {
      console.error("getAllFavourites Error:", error.message);
      return [];
    }
  }
  async function getAds() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/getAds?ads_page=main_slider&city=Hyderabad`,
        {
          cache: "force-cache",
        }
      );
      if (!res.ok) throw new Error("Failed to fetch");
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
      return [];
    } catch (error) {
      console.error("getAds Error:", error.message);
      return [];
    }
  }
  async function getUserContacted(userId) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/getUserContactSellers?user_id=${userId}`
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const response = await res.json();
      const contacts = response?.results || [];
      const contactIds = Array.isArray(contacts)
        ? contacts.map((contact) => contact.unique_property_id)
        : [];
      return contactIds;
    } catch (error) {
      console.error("getUserContacted Error:", error.message);
      return [];
    }
  }
  async function getMainSliderAds(city = "Hyderabad") {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/getAds?ads_page=main_slider&city=${city}`,
        { cache: "force-cache" }
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      if (!data.ads?.length) {
        return [{ id: 1, order: 1, video_url: "/fallback-banner.jpg" }];
      }
      return data.ads
        .sort((a, b) => a.ads_order - b.ads_order)
        .map((item) => ({
          id: item.id,
          order: item.ads_order,
          video_url: `https://api.meetowner.in/aws/v1/s3/${item.image}`,
        }));
    } catch (error) {
      console.error("getMainSliderAds Error:", error.message);
      return [{ id: 1, order: 1, video_url: "/fallback-banner.jpg" }];
    }
  }
  const [
    { properties },
    bestDealProperties,
    bestMeetownerProperties,
    highDemandProperties,
    recommendedSellers,
    meetownerExclusive,
    favourites,
    formatted,
    contacted,
    mediaList,
  ] = await Promise.all([
    getLatestProperties(),
    getBestDealProperties(),
    getBestMeetowner(),
    getHighDemand(),
    getRecommended(),
    getMeetExclusive(),
    getAllFavourites(userId),
    getAds(),
    getUserContacted(userId),
    getMainSliderAds(),
  ]);
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
        mediaList={mediaList}
      />
    </div>
  );
}
