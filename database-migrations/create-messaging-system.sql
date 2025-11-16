-- Bride-Vendor Messaging System Schema

-- Create conversations table
CREATE TABLE IF NOT EXISTS vendor_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bride_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(bride_id, vendor_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS vendor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES vendor_conversations(id) ON DELETE CASCADE,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('bride', 'vendor')),
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  sent_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create message attachments table (for future photo sharing)
CREATE TABLE IF NOT EXISTS message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES vendor_messages(id) ON DELETE CASCADE,
  file_type VARCHAR(50) NOT NULL,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_size INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendor_conversations_bride ON vendor_conversations(bride_id);
CREATE INDEX IF NOT EXISTS idx_vendor_conversations_vendor ON vendor_conversations(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_conversations_last_message ON vendor_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_messages_conversation ON vendor_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_vendor_messages_sent_at ON vendor_messages(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_messages_read ON vendor_messages(read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_message_attachments_message ON message_attachments(message_id);

-- Disable RLS for service role access
ALTER TABLE vendor_conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments DISABLE ROW LEVEL SECURITY;

-- Add comments
COMMENT ON TABLE vendor_conversations IS 'Stores conversation threads between brides and vendors';
COMMENT ON TABLE vendor_messages IS 'Stores individual messages in vendor conversations';
COMMENT ON TABLE message_attachments IS 'Stores file attachments sent in messages (photos, PDFs, etc.)';
COMMENT ON COLUMN vendor_messages.sender_type IS 'Either ''bride'' or ''vendor'' to identify who sent the message';
COMMENT ON COLUMN vendor_messages.read IS 'Tracks if the message has been read by the recipient';

-- Function to update conversation last_message_at timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE vendor_conversations
  SET last_message_at = NEW.sent_at,
      updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update conversation timestamp when new message is sent
CREATE TRIGGER update_conversation_on_message
AFTER INSERT ON vendor_messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();

-- Function to get unread message count for a conversation
CREATE OR REPLACE FUNCTION get_unread_count(conv_id UUID, user_type VARCHAR)
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO unread_count
  FROM vendor_messages
  WHERE conversation_id = conv_id
    AND sender_type != user_type
    AND read = false;
  RETURN unread_count;
END;
$$ LANGUAGE plpgsql;
