"use client"

import React, { useState } from 'react'
import { Button } from './ui/button'
import { Loader, Loader2Icon } from 'lucide-react'
import toast from 'react-hot-toast'
import { toggleFollow } from '@/actions/user.action'

function FollowButton({userId}: {userId: string}) {
    const [isloading, setIsLoading] = useState(false)
    

    const handleFollow = async () => {
        setIsLoading(true)
        try {
            await toggleFollow(userId)
            toast.success("Followed user successfully")
            // setIsLoading(false)
            setIsLoading(false)
        } catch (error) {
            console.log("error following user", error)
            toast.error("error following user")
        } finally{

        }

    }
  return (
    <Button
    size={"sm"}
    variant={"secondary"}
    onClick={handleFollow}
    disabled={isloading}
    className='w-20'
>
      {isloading ? <Loader2Icon className='w-4 h-4 animate-spin'/> : "Follow"} {/*i can also use size-4  */}
    </Button>
  )
}

export default FollowButton
