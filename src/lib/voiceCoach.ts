// AI Coach - Conversational journaling assistant
// Generates contextual questions and responses to guide users through reflection

interface CoachMessage {
  role: 'coach' | 'user';
  content: string;
  timestamp: Date;
}

interface ConversationContext {
  messages: CoachMessage[];
  totalDuration: number; // Total recording time in seconds
}

// Opening questions based on time of day
function getOpeningQuestion(): string {
  const hour = new Date().getHours();

  const morningQuestions = [
    "Good morning. How are you feeling as you start your day?",
    "Hey there. What's on your mind this morning?",
    "Morning. How did you sleep, and what's the first thing you're thinking about today?",
    "Hi. Before the day gets going, what's something you're looking forward to or thinking about?",
  ];

  const afternoonQuestions = [
    "Hey. How's your day going so far?",
    "Hi there. What's been on your mind today?",
    "Afternoon. Anything from today that you'd like to talk through?",
    "Hey. How are you feeling right now, in this moment?",
  ];

  const eveningQuestions = [
    "Hey. How was your day?",
    "Evening. What's something from today that stuck with you?",
    "Hi. As your day winds down, what's on your mind?",
    "Hey there. Anything you want to reflect on from today?",
  ];

  const nightQuestions = [
    "Hey. How are you feeling tonight?",
    "Hi. What's keeping you up or on your mind right now?",
    "Late night thoughts? I'm here to listen.",
    "Hey. Before you rest, is there anything you want to get off your chest?",
  ];

  let questions: string[];
  if (hour >= 5 && hour < 12) {
    questions = morningQuestions;
  } else if (hour >= 12 && hour < 17) {
    questions = afternoonQuestions;
  } else if (hour >= 17 && hour < 21) {
    questions = eveningQuestions;
  } else {
    questions = nightQuestions;
  }

  return questions[Math.floor(Math.random() * questions.length)];
}

// Generate a follow-up question based on what the user said
export async function generateCoachResponse(
  userMessage: string,
  context: ConversationContext,
  wantsToContinue: boolean
): Promise<string> {
  // If user wants to wrap up, give a closing response
  if (!wantsToContinue) {
    return generateClosingResponse(userMessage, context);
  }

  // Generate a thoughtful follow-up question
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a warm, genuine journaling coach having a voice conversation. Your role is to help people reflect and process their thoughts through gentle questioning.

Guidelines:
- Be warm but not overly enthusiastic or fake
- Ask ONE short, thoughtful follow-up question (1-2 sentences max)
- Don't be preachy or give advice unless asked
- Be curious and genuinely interested
- Use casual, natural language (like talking to a friend)
- Acknowledge what they shared briefly before your question
- Help them go deeper into what they're feeling or thinking
- Never use phrases like "That's wonderful!" or "Great job!" - be authentic
- Your response will be spoken aloud, so keep it conversational

Example good responses:
- "That sounds tough. What do you think is making it feel so heavy?"
- "Interesting. When you say frustrated, where do you feel that in your body?"
- "Mmm. And how long have you been sitting with that?"
- "I hear you. What would make this feel even a little bit better?"`,
          },
          ...context.messages.map((m) => ({
            role: m.role === 'coach' ? 'assistant' : 'user',
            content: m.content,
          })),
          {
            role: 'user',
            content: userMessage,
          },
        ],
        max_tokens: 100,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate response');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "Tell me more about that.";
  } catch (error) {
    console.error('Coach response generation failed:', error);
    // Fallback follow-up questions
    const fallbacks = [
      "Tell me more about that.",
      "How does that make you feel?",
      "What else comes to mind when you think about that?",
      "And what do you think that means for you?",
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}

// Generate a closing response when user is done
function generateClosingResponse(userMessage: string, context: ConversationContext): string {
  const closings = [
    "Thanks for sharing with me today. Take care of yourself.",
    "I appreciate you opening up. Hope the rest of your day goes well.",
    "Thanks for talking through that. See you next time.",
    "Glad we could chat. Take it easy.",
    "Thanks for sharing. Remember, you can always come back when you need to talk.",
  ];

  return closings[Math.floor(Math.random() * closings.length)];
}

// Generate the "continue or done" prompt
export function getContinuePrompt(): string {
  const prompts = [
    "Would you like to explore that more, or are you good for today?",
    "We can keep going if you'd like, or wrap up here. What feels right?",
    "Want to dig into that a bit more, or is this a good stopping point?",
    "Should we continue, or does that feel complete for now?",
  ];

  return prompts[Math.floor(Math.random() * prompts.length)];
}

export { getOpeningQuestion, type CoachMessage, type ConversationContext };
