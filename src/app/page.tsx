// import prisma from "@/lib/prisma";

import { getPosts } from "@/actions/post.actions";
import { getDbUserId } from "@/actions/user.action";
import Createpost from "@/components/Createpost";
import Postcard from "@/components/Postcard";
import RecommendedUsers from "@/components/RecommendedUsers";
import { currentUser } from "@clerk/nextjs/server";


export default async function Home() {
   const user = await currentUser();
   const posts = await getPosts()
   const dbUserId = await getDbUserId();

   console.log({posts});
  // await prisma
  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        <div className="grid lg:col-span-6">
          {
            user ? <Createpost/> : null
          }
          <div className="space-y-4">
              {
                posts.map((post) => (
                  <Postcard  key={post.id} post={post} dbUserId={dbUserId}/>
                ))
              }
          </div>
        </div>

        <div className="hidden lg:block lg:col-span-4 sticky top-20">
          <RecommendedUsers/>
        </div>
    </div>
  );
}
