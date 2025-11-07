import { NextResponse } from "next/server";
export function middleware(request) {
  const { pathname, search } = request.nextUrl;
  if (pathname === "/property" && search) {
    const fullQuery = search.slice(1);
    const match = fullQuery.match(/(.+)_Id_([MO-\d]+)/);
    if (match) {
      const [_, slugPart, propertyId] = match;
      const canonicalSlug = slugPart.replace(/_Id_/, "");
      const canonicalUrl =
        request.nextUrl.origin + `/property/${canonicalSlug}/${propertyId}`;
      return NextResponse.redirect(canonicalUrl, 301);
    }
  }
  return NextResponse.next();
}
export const config = {
  matcher: "/property",
};
