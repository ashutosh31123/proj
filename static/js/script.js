// Sample dataset (replace with your actual dataset)
const contacts = [
    { id: 1, name: "John Doe", email: "johndoe@example.com", phone: "1234567890" },
    { id: 2, name: "Jane Doe", email: "janedoe@example.com", phone: "0987654321" },
    { id: 3, name: "Bob Smith", email: "bobsmith@example.com", phone: "5551234567" },
    // Add more contacts as needed
];

// Generate text button event listener
document.getElementById("generate-text").addEventListener("click", () => {
    const aiInput = document.getElementById("ai-input").value;
    console.log('Generating text for input:', aiInput);
    fetch('/generate_text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: aiInput })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Generated text:', data);
        document.getElementById("generated-text").value = data.generated_text;
    })
    .catch(error => console.error('Error:', error));
});

// Send message button event listeners
document.getElementById("send-whatsapp").addEventListener("click", () => {
    sendMessage("whatsapp");
});

document.getElementById("send-sms").addEventListener("click", () => {
    sendMessage("sms");
});

document.getElementById("send-email").addEventListener("click", () => {
    sendMessage("email");
});

// Function to send message
function sendMessage(channel) {
    const selectedContacts = getSelectedContacts();
    const generatedText = document.getElementById("generated-text").value;

    console.log('Sending message:', generatedText, 'via', channel, 'to contacts:', selectedContacts);

    fetch('/send_message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts: selectedContacts, message: generatedText, channel: channel })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Message sent:', data);
    })
    .catch(error => console.error('Error:', error));
}

// Function to get selected contacts
function getSelectedContacts() {
    const contactList = document.getElementById("contact-list");
    const selectedContacts = [];
    for (let i = 0; i < contactList.children.length; i++) {
        const contact = contactList.children[i];
        if (contact.classList.contains("selected")) {
            selectedContacts.push(contacts[contact.dataset.id - 1]);
        }
    }
    return selectedContacts;
}

// Populate contact list
const contactListElement = document.getElementById("contact-list");
contacts.forEach(contact => {
    const li = document.createElement("li");
    li.textContent = contact.name;
    li.dataset.id = contact.id;
    li.addEventListener("click", () => {
        li.classList.toggle("selected");
    });
    contactListElement.appendChild(li);
});

// Select all contacts
document.getElementById("select-all").addEventListener("click", () => {
    const contactList = document.getElementById("contact-list");
    for (let i = 0; i < contactList.children.length; i++) {
        const contact = contactList.children[i];
        contact.classList.add("selected");
    }
});

// Direct message input and send functionality
document.getElementById("send-direct-message").addEventListener("click", () => {
    const directMessage = document.getElementById("typed-message").value;
    if (directMessage.trim() === '') {
        alert('Please enter a message to send.');
        return;
    }
    showMessageOptions(directMessage);
});

function showMessageOptions(message) {
    const optionsContainer = document.getElementById("send-options");
    optionsContainer.style.display = 'block';

    document.getElementById("send-whatsapp").addEventListener("click", () => {
        sendDirectMessage(message, "whatsapp");
    });

    document.getElementById("send-sms").addEventListener("click", () => {
        sendDirectMessage(message, "sms");
    });

    document.getElementById("send-email").addEventListener("click", () => {
        sendDirectMessage(message, "email");
    });
}

function sendDirectMessage(message, channel) {
    const selectedContacts = getSelectedContacts();

    console.log('Sending direct message:', message, 'via', channel, 'to contacts:', selectedContacts);

    fetch('/send_message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts: selectedContacts, message: message, channel: channel })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Direct message sent:', data);
    })
    .catch(error => console.error('Error:', error));
}
