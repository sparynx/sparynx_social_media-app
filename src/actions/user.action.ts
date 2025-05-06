"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function syncUser() {
    try {
        const {userId} = await auth()
        const user = await currentUser()

        if(!userId || !user) return;

        const exixtingUser = await prisma.user.findUnique({
            where: {
                clerkId: userId
            },
        });
        if (exixtingUser) return exixtingUser

        const dbUser = await prisma.user.create({
            data: {
                clerkId: userId,
                name: `${user.firstName || ""} ${user.lastName || ""}`,
                username: user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
                email: user.emailAddresses[0].emailAddress,
                image: user.imageUrl
            }
        })

        return dbUser;
    } catch (error) {   
        console.log("error in sync user", error)
    }
}

export async function getUserByClerkId(clerkId: string) {
    return prisma.user.findUnique({
        where: {
            clerkId: clerkId,
        },
        include:{
            _count: {
                select: {
                    followers: true,
                    following: true,
                    posts: true
                }
            }
        }
    })
}


export async function getDbUserId() {
    const {userId: clerkId } = await auth();
    if(!clerkId) return null

    const user = await getUserByClerkId(clerkId)

    if(!user) throw new Error("user not found")
    
    return user.id
}

export async function getRandomUsers() {
    try {
        const userId = await getDbUserId()

        if(!userId) return []

        //get three random user exclude the already following user or my account

        const randomUser = await prisma.user.findMany({
            where: {
                AND: [
                    {NOT:{id: userId}},
                    {
                        NOT: {
                            followers: {
                                some: {
                                    followerId: userId
                                }
                            }
                        }
                    }

                ]
            },
            select: {
                id: true,
                name: true,
                image: true,
                username: true,
                _count: {
                    select: {
                        followers: true,
                        // following: true
                    }
                }
            },
            take: 3,
        })

        return randomUser
    } catch (error) {
        console.log("error in get random users", error)
        return [];
    }
}

export async function toggleFollow(targetUserId: string) {
    try {
        const userId = await getDbUserId()

        if (!userId) return;

        if (userId === targetUserId) throw new Error("You cannot follow yourself")
        const existingFollow = await prisma.follows.findUnique({
            where: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: targetUserId
                }
            }
    })

    if (existingFollow) {
        //unfollow
        await prisma.follows.delete({
            where: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: targetUserId
                }
            }
        })

    }
    else {
        //follow
        await prisma.$transaction([
            prisma.follows.create({
                data: {
                    followerId: userId,
                    followingId: targetUserId
                }
            }),
            prisma.notification.create({
                data: {
                    userId: targetUserId, //user being followed
                    creatorId: userId, //user following
                    type: "FOLLOW",
                }
            })
        ])

    }
    revalidatePath("/")
    return {success: true}

    } catch (error) {
        console.log("error in toggle follow", error)
        return {success: false, error: "Something went wrong"}
    }
}