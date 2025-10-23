import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get token from Authorization header or cookie
    const authHeader = request.headers.get("authorization");
    const token =
      authHeader?.replace("Bearer ", "") || request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const backendUrl = process.env.BACKEND_URL || "http://localhost:29000";

    const response = await fetch(`${backendUrl}/products/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Failed to fetch product" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Product API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Get token from Authorization header or cookie
    const authHeader = request.headers.get("authorization");
    const token =
      authHeader?.replace("Bearer ", "") || request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const backendUrl = process.env.BACKEND_URL || "http://localhost:29000";

    const response = await fetch(`${backendUrl}/products/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Failed to update product" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Product update API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get token from Authorization header or cookie
    const authHeader = request.headers.get("authorization");
    const token =
      authHeader?.replace("Bearer ", "") || request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const backendUrl = process.env.BACKEND_URL || "http://localhost:29000";

    const response = await fetch(`${backendUrl}/products/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(
        { success: false, message: data.message || "Failed to delete product" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Product delete API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
