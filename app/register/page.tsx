"use client"
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'


function Register(){
    const [email,setEmail]=useState("")
    const [password,setPassword]=useState("")
    const [confirmPassword,setConfirmPassword]=useState("")
    const [error,setError]=useState("")
    const router=useRouter()
    const handleSubmit=async (e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault()
        if(password!==confirmPassword){
            setError("Your password does not match")
        }
        try{
            const res=await fetch("/api/auth/register",{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({email,password})
            })
            const data=res.json()
            if(!res.ok){
                setError("Registration Failed")
            }
            router.push("/login")
        }
        catch(error){
            setError("Network error");
        }
    }
    return(
        <div>
            <form onSubmit={handleSubmit} className='space-y-4 bg-white p-6 rounded-lg shadow-md max-w-md mx-auto'>
                {error && <p className='text-red-500 text-sm'>{error}</p>}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" className='input input-bordered w-full mt-2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' value={email} onChange={(e)=>setEmail(e.target.value)} required/>
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                    <input type="password" className='input input-bordered w-full mt-2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' value={password} onChange={(e)=>setPassword(e.target.value)} required />
                </div>
                <button type="submit" className='btn btn-primary w-full mt-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500'>Register</button>
            </form>
        </div>
    )
}
export default Register