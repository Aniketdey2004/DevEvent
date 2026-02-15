import connectDB from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { Event } from "@/database";
export async function GET(req:NextRequest,{ params }:{params:Promise<{slug:string}>}){
    try{
        await connectDB();
        const {slug}=await params;
        const event=await Event.findOne({slug}).lean();

        if(!event){
            return NextResponse.json(
                {message: 'Event not found'},
                {status: 404}
            );
        }

        return NextResponse.json({event}, {status: 200});
    }catch(error){
        return NextResponse.json(
            {message: "Internal Server Error"},
            {status : 500}
        );
    }
}