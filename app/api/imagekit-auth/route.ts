import { NextResponse } from "next/server";
import ImageKit from "imagekit";
import {auth} from "@clerk/nextjs/server"

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_URL_ENDPOINT!,
});

export async function GET() {
  try{
    const {userId}=await auth()
    if(!userId){
      return NextResponse.json({error:"Unauthorized"},{status:401})
    }
    const authParams=imagekit.getAuthenticationParameters()
    return NextResponse.json(authParams)
  }
  catch(error){
    return NextResponse.json({ error: "Authentication failed" },{status: 500,});
  }
}