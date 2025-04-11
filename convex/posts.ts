import {mutation, query} from './_generated/server';
import {ConvexError, v} from "convex/values"
import { getAuthendicatedUser } from './users';

export const generateUploadUrl = mutation(async (ctx)=>{
    const identity = await ctx.auth.getUserIdentity()
    if(!identity){
        throw new Error("Not authenticated")
    }
    return await ctx.storage.generateUploadUrl()
})

export const createPost = mutation({
    args:{
        caption:v.optional(v.string()),
        storageId:v.id("_storage"),
    },
    handler:async(ctx,args)=>{
        try{
       const currentUser = await getAuthendicatedUser(ctx)
        const imageUrl = await ctx.storage.getUrl(args.storageId)
        if(!imageUrl){
            throw new Error("Image not found")
        }
        if (args.caption && args.caption.length > 280) {
            throw new Error("Caption en fazla 280 karakter olabilir.");
        }
        const postId = await ctx.db.insert("posts",{
            userId:currentUser._id,
            storageId:args.storageId,
            imageUrl:imageUrl,
            caption:args.caption,
            likes:0,
            comments:0,
        })
        await ctx.db.patch(currentUser._id,{
            posts:currentUser.posts+1,
        })
        return postId
       } catch (error) {
            console.error("createPost mutation hatası:", error);
            throw new Error("Post oluşturulurken bir hata oluştu.");
       }
    }
})

export const getFeedPosts = query({
    handler:async (ctx)=>{
        const currentUser = await getAuthendicatedUser(ctx)
        const posts = await ctx.db.query("posts").order("desc").collect()
        if (posts.length === 0) {
            return [];
            
        }
        const postWithInfo = await Promise.all(posts.map(async (post) => {
            const postUser = (await ctx.db.get(post.userId))!
            const like = await ctx.db.query("likes").withIndex("by_user_and_post",(q)=>q.eq("userId",currentUser._id).eq("postId",post._id)).first()
            const bookmark = await ctx.db.query("bookmarks").withIndex("by_user_and_post",(q)=>q.eq("userId",currentUser._id).eq("postId",post._id)).first()
            return {
                ...post,
                author: {
                    _id: postUser?._id,
                    username: postUser?.username,
                    image: postUser?.image,
                },
                isLiked: !!like ,
                isBookmarked: !!bookmark 
            }
        }))
        return postWithInfo;
    }
})

export const toggleLike = mutation({
    args:{
        postId:v.id("posts"),
    },
    handler:async(ctx,args)=>{
        const currentUser = await getAuthendicatedUser(ctx)
        const existingLike = await ctx.db.query("likes").withIndex("by_user_and_post",(q)=>q.eq("userId",currentUser._id).eq("postId",args.postId)).first()
        const post = await ctx.db.get(args.postId)
        if(!post){
            throw new Error("Post not found")
        }
        if(existingLike){
            await ctx.db.delete(existingLike._id)
            await ctx.db.patch(args.postId,{
                likes:post.likes-1
            })
            return false;
        }else{
            await ctx.db.insert("likes",{
                userId:currentUser._id,
                postId:post._id,
            })
            await ctx.db.patch(post._id,{
                likes:post.likes+1
            })
            if (currentUser._id !== post.userId) {
                await ctx.db.insert("notifications", {
                    receiverId: post.userId,
                    senderId: currentUser._id,
                    type: "like",
                    postId: args.postId,
                });
                
            }
            return true;
        }
       
        
    }
})
export const addComment = mutation({
    args:{
        postId:v.id("posts"),
        comment:v.string(),
    },
    handler:async(ctx,args)=>{
        const currentUser = await getAuthendicatedUser(ctx)
        const post = await ctx.db.get(args.postId)
        if (!post) {
            throw new ConvexError("Post not found");
        }
        if (args.comment.length > 280) {
            throw new ConvexError("Comment must be less than 280 characters");
        }
        const commentId = await ctx.db.insert("comments",{
            userId:currentUser._id,
            postId:args.postId,
            comment:args.comment,
        })
        await ctx.db.patch(args.postId,{
            comments:post.comments+1
        })
        if (currentUser._id !== post.userId) {
            await ctx.db.insert("notifications", {
                receiverId: post.userId,
                senderId: currentUser._id,
                type: "comment",
                postId: args.postId,
                commentId
            });
        }
        return commentId;

    }
})
export const getComments = query({
    args:{
        postId:v.id("posts"),
    },
    handler:async(ctx,args)=>{
        
        const comments = await ctx.db.query("comments").withIndex("by_post",(q)=>q.eq("postId",args.postId)).order("desc").collect()
        if(comments.length === 0){
            return []
        }
        const commentsWithUser = await Promise.all(comments.map(async(comment)=>{
            const user = (await ctx.db.get(comment.userId))!
            return {
                ...comment,
                user:{
                    _id:user._id,
                    username:user!.username,
                    image:user!.image,
                }
            }
        }))
        return commentsWithUser
    }
})