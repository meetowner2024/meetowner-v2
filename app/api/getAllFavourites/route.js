export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get("user_id");
    if (!user_id) {
      return Response.json({ message: "User ID is required" }, { status: 400 });
    }
    const favquery = `
      SELECT 
          f.user_id,
          f.searched_on_date,
          f.searched_on_time,
          p.unique_property_id,
          p.property_name,
          p.property_type,
          p.sub_type,
          p.property_for,
          p.unit_flat_house_no,
          p.state_id,
          p.city_id,
          p.location_id,
          p.street,
          p.address,
          p.zipcode,
          p.latitude,
          p.longitude,
          p.bedrooms,
          p.builtup_area,
          p.builtup_unit,
          p.additional_amount,
          p.property_cost,
          p.bathroom,
          p.balconies,
          p.property_in,
          p.facing,
          p.car_parking,
          p.bike_parking,
          p.facilities,
          p.floors,
          p.furnished_status,
          p.transaction_type,
          p.owner_name,
          p.mobile,
          p.whatsapp,
          p.landline,
          p.email,
          p.occupancy,
          p.description,
          p.video_link,
          p.property_status,
          p.admin_approved_status,
          p.posted_by,
          p.paid_details,
          p.other_info,
          p.created_date,
          p.created_time,
          p.updated_date,
          p.updated_time,
          p.admin_approval_date,
          p.image,
          p.google_address,
          p.user_type,
          p.total_floors,
          p.open_parking,
          p.carpet_area,
          p.under_construction,
          p.ready_to_move,
          p.updated_from,
          p.property_age,
          p.types,
          p.available_from,
          p.monthly_rent,
          p.security_deposit,
          p.maintenance,
          p.lock_in,
          p.brokerage_charge,
          p.plot_area,
          p.ownership_type,
          p.length_area,
          p.width_area,
          p.zone_types,
          p.business_types,
          p.rera_approved,
          p.passenger_lifts,
          p.service_lifts,
          p.stair_cases,
          p.private_parking,
          p.public_parking,
          p.private_washrooms,
          p.public_washrooms,
          p.area_units,
          p.pent_house,
          p.servant_room,
          p.possession_status,
          p.builder_plot,
          p.investor_property,
          p.loan_facility,
          p.plot_number,
          p.pantry_room,
          p.total_project_area,
          p.uploaded_from_seller_panel,
          p.featured_property,
          p.total_project_area_type,
          p.land_sub_type,
          p.unit_cost_type,
          p.property_cost_type,
          p.builder_name,
          p.villa_number
      FROM favourites f
      LEFT JOIN properties p ON f.unique_property_id = p.unique_property_id
      WHERE f.user_id = ?
      ORDER BY f.searched_on_date DESC, f.searched_on_time DESC
    `;
    const { query } = await import("@/lib/server/db");
    const results = await query(favquery, [user_id]);
    const favourites = results.map((row) => ({
      user_id: row.user_id,
      searched_on_date: row.searched_on_date,
      searched_on_time: row.searched_on_time,
      ...row,
    }));
    return Response.json({ favourites }, { status: 200 });
  } catch (err) {
    console.error("Error fetching favourites:", err);
    return Response.json(
      { error: "Database error", details: err.message },
      { status: 500 }
    );
  }
}
