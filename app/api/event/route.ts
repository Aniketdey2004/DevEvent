import connectDB from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { Event } from "@/database";
import cloudinary from "@/lib/cloudinaryConfig";
export async function POST(req: NextRequest){
    try {
        await connectDB();

        const formData=await req.formData();

        let event;

        try {
            event=Object.fromEntries(formData.entries());
        } catch (error) {
            return NextResponse.json({message: 'Invalid JSON data format'}, { status:400 })
        }
        const file=formData.get('image') as File;

        if(!file){
            return NextResponse.json({message: 'Image file is required'}, {status:400});
        }

        const bytes=await file.arrayBuffer();
        const buffer=Buffer.from(bytes);

        const result=await new Promise((resolve,reject)=>{
            cloudinary.uploader.upload_stream(
                {folder: "nextjs_uploads"},
                (error,result)=>{
                    if(error) reject(error);
                    else resolve(result);
                }
            ).end(buffer)
        });

        event.image=(result as {secure_url: string}).secure_url;
        const createdEvent=await Event.create(event);

        return NextResponse.json({ message: 'Event created successfully', event:createdEvent }, { status:201 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: 'Event Creation failed' , error: e instanceof Error ? e.message:'Unknown'}, { status:500 });
    }
}