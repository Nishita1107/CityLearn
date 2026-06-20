import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { cookies } from "next/headers";
import { createUser, toPublicUser } from "@/lib/users";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const db = await connectDB();
    const isFallback = !!(db && (db as any).isFallback);

    const guestId = Math.random().toString(36).substring(2, 10);
    const guestEmail = `guest_${guestId}@citylearn.local`;
    const guestName = `Guest_${guestId}`;
    const guestPassword = Math.random().toString(36).substring(2, 15);

    if (isFallback) {
      const newUser = createUser({
        email: guestEmail,
        password: guestPassword,
        name: guestName,
        department: "Guest Department",
        role: "Guest",
        country: "N/A",
        state: "N/A",
        city: "N/A",
      });

      const cookieStore = await cookies();
      cookieStore.set("userId", newUser.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      });

      return NextResponse.json({
        success: true,
        message: "Logged in as guest (offline fallback).",
        user: toPublicUser(newUser),
      });
    }

    const hashedPassword = hashPassword(guestPassword);
    const newUser = await User.create({
      name: guestName,
      email: guestEmail,
      password: hashedPassword,
      department: "Guest Department",
      role: "Guest",
      country: "N/A",
      state: "N/A",
      city: "N/A",
    });

    const cookieStore = await cookies();
    cookieStore.set("userId", newUser._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Logged in as guest.",
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        department: newUser.department,
        role: newUser.role,
        country: newUser.country,
        state: newUser.state,
        city: newUser.city,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Guest login error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred during guest login." },
      { status: 500 }
    );
  }
}
