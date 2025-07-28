/**
 * Conversation status enum
 */
export var ConversationStatus;
(function (ConversationStatus) {
    ConversationStatus["Recording"] = "recording";
    ConversationStatus["Processing"] = "processing";
    ConversationStatus["Completed"] = "completed";
    ConversationStatus["Failed"] = "failed";
})(ConversationStatus || (ConversationStatus = {}));
/**
 * Type guard to check if a conversation is completed
 */
export function isConversationCompleted(conversation) {
    return conversation.status === ConversationStatus.Completed &&
        conversation.endTime !== undefined &&
        conversation.summary !== undefined;
}
/**
 * Type guard to check if a segment is final
 */
export function isFinalSegment(segment) {
    return segment.isFinal === true;
}
