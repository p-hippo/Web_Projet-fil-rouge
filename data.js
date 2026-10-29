const Data = {
    async fetchChannel(){
        return await supabaseClient
        .from("Salon")
        .select("*")
        .order("name");
    },

    async createChannel(name) {
    return await supabaseClient
      .from("Salon")
      .insert({ name })
      .select()
      .single();
    },

  async fetchMessages(channelId) {
    return await supabaseClient
      .from("Messages")
      .select(`
        id, 
        created_at, 
        content, 
        sender_id,
        Users (
          name
        )
      `)
      .eq("salon_id", channelId)
      .order("created_at", { ascending: false })
      .limit(50);
    },

    async sendMessage(channelId, content, numericSenderId) {
    return await supabaseClient
      .from("Messages")
      .insert({ 
        salon_id: channelId, 
        content: content, 
        sender_id: numericSenderId 
      });
    },

    subscribeToChannels(onNewChannel) {
    supabaseClient
      .channel("salons-realtime")
      .on(
        "postgres_changes",
        { 
          event: "INSERT", 
          schema: "public", 
          table: "Salon" 
        },
        (payload) => onNewChannel(payload.new)
      )
      .subscribe();
    },

    subscribeToMessages(channelId, onNewMessage) {
    const subscription = supabaseClient
      .channel("messages-" + channelId)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Messages",
          filter: "salon_id=eq." + channelId,
        },
        (payload) => onNewMessage(payload.new)
      )
      .subscribe();
    
     return () => supabaseClient.removeChannel(subscription);
    },
}