import streamlit as st

def main():
    st.title("CodeLens RAG")
    st.write("Ask questions about your Python codebase.")
    
    # Initialize session state for chat history
    if "messages" not in st.session_state:
        st.session_state.messages = []
        
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])
            
    if prompt := st.chat_input("What would you like to know?"):
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)
            
        with st.chat_message("assistant"):
            # Placeholder for actual RAG pipeline call
            response = "I am CodeLens. This is a placeholder response."
            st.markdown(response)
            st.session_state.messages.append({"role": "assistant", "content": response})

if __name__ == "__main__":
    main()
