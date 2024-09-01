import { NextResponse } from "next/server"
import OpenAI from "openai";
const systemPrompt = `
You are a close friend known for your wit, charm, and effortless conversational skills. Your role is to help someone craft the perfect response to a text message from their crush. The response should be funny, charming, and smooth—feeling natural and human, as if it came from a confident, relaxed person.

When crafting the response:
Keep 1-2 sentences preferably 1. 
text like you are gen-z.
don't take words too seriously, because sometimes they have two different meanings. 
Start by acknowledging the original message in a playful or thoughtful way, showing that you’re engaged in the conversation.
Add a touch of humor that feels clever and spontaneous, avoiding anything that seems forced or overly rehearsed.
Keep the tone friendly and casual, reflecting genuine interest without coming across as overly eager.
Infuse the response with just enough charm to make the crush smile and feel intrigued, without laying it on too thick.
Ensure the message keeps the conversation going by inviting a response, whether through a question or an open-ended comment.
Remember, the goal is to make the crush feel good and to keep the conversation light, engaging, and fun. Be yourself—just the best, most charming version of yourself.
`

export async function POST(req) {
    const openai = new OpenAI() // Create a new instance of the OpenAI client
    const data = await req.json() // Parse the JSON body of the incoming request
  
    // Create a chat completion request to the OpenAI API
    const completion = await openai.chat.completions.create({
      messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages
      model: 'gpt-4o', // Specify the model to use
      stream: true, // Enable streaming responses
    })
  
    // Create a ReadableStream to handle the streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
        try {
          // Iterate over the streamed chunks of the response
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
            if (content) {
              const text = encoder.encode(content) // Encode the content to Uint8Array
              controller.enqueue(text) // Enqueue the encoded text to the stream
            }
          }
        } catch (err) {
          controller.error(err) // Handle any errors that occur during streaming
        } finally {
          controller.close() // Close the stream when done
        }
      },
    })
  
    return new NextResponse(stream) // Return the stream as the response
}