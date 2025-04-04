document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const dataForm = document.getElementById('data-form');
    
    let currentQuestion = 0;
    let userData = {
        password: '',
        fullName: '',
        phone: '',
        email: '',
        department: '',
        problem: ''
    };
    
    const questions = [
        {
            text: "مرحبا بك في قسم SG. هذا القسم مختص في حل المشاكل في نادي النظرة المستقبلية. نرجو منك الإجابة على كل الأسئلة التي تطرح عليك بشكل صحيح.",
            isWelcome: true
        },
        {
            text: "اكتب كلمة المرور بأنك مسؤول",
            field: 'password',
            validate: (value) => value.trim().toLowerCase() === 'nadia'
        },
        {
            text: "أكتب الإسم واللقب",
            field: 'fullName',
            validate: (value) => value.trim().length > 0
        },
        {
            text: "أكتب رقم الهاتف",
            field: 'phone',
            inputType: 'tel',
            validate: (value) => /^[0-9]{10,15}$/.test(value.trim())
        },
        {
            text: "أكتب البريد الإلكتروني",
            field: 'email',
            inputType: 'email',
            validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
        },
        {
            text: "مسؤول عن قسم:",
            field: 'department',
            isOptions: true,
            options: ['RH', 'RE', 'MEDIA', 'DESING'],
            validate: (value) => ['RH', 'RE', 'MEDIA', 'DESING'].includes(value)
        },
        {
            text: "ماهي المشكلة بالتفصيل",
            field: 'problem',
            validate: (value) => value.trim().length > 10
        }
    ];
    
    // Start the conversation
    setTimeout(() => {
        addBotMessage(questions[0].text);
        setTimeout(() => askQuestion(1), 1000);
    }, 500);
    
    function addBotMessage(text, isWelcome = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'bot-message');
        if (isWelcome) messageDiv.classList.add('welcome-message');
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function addUserMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'user-message');
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function addErrorMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'error-message');
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function askQuestion(index) {
        currentQuestion = index;
        const question = questions[index];
        
        addBotMessage(question.text);
        
        if (question.inputType) {
            userInput.type = question.inputType;
        } else {
            userInput.type = 'text';
        }
        
        userInput.placeholder = question.text;
        userInput.focus();
        
        // Show options immediately for department question
        if (question.isOptions) {
            showOptions(question.options);
            userInput.style.display = 'none'; // Hide input for options
            sendBtn.style.display = 'none'; // Hide send button for options
        } else {
            userInput.style.display = 'block';
            sendBtn.style.display = 'flex';
        }
    }
    
    function showOptions(options) {
        // Clear any existing options
        const existingOptions = document.querySelectorAll('.options-container');
        existingOptions.forEach(option => option.remove());
        
        const optionsContainer = document.createElement('div');
        optionsContainer.classList.add('options-container');
        
        options.forEach(option => {
            const optionBtn = document.createElement('button');
            optionBtn.classList.add('option-btn');
            optionBtn.textContent = option;
            optionBtn.addEventListener('click', () => {
                // Add user message with the selected option
                addUserMessage(option);
                
                // Store the answer
                userData[questions[currentQuestion].field] = option;
                
                // Move to next question
                if (currentQuestion < questions.length - 1) {
                    setTimeout(() => {
                        askQuestion(currentQuestion + 1);
                    }, 500);
                } else {
                    // Form completed
                    showCompletionMessage();
                }
            });
            optionsContainer.appendChild(optionBtn);
        });
        
        chatMessages.appendChild(optionsContainer);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function showCompletionMessage() {
        // Fill the hidden form with collected data
        document.getElementById('form-password').value = userData.password;
        document.getElementById('form-fullName').value = userData.fullName;
        document.getElementById('form-phone').value = userData.phone;
        document.getElementById('form-email').value = userData.email;
        document.getElementById('form-department').value = userData.department;
        document.getElementById('form-problem').value = userData.problem;
        
        // Submit the form via AJAX
        const formData = new FormData(dataForm);
        
        fetch(dataForm.action, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            const successDiv = document.createElement('div');
            successDiv.classList.add('success-message');
            successDiv.innerHTML = `
                تم إرسال المعلومات بنجاح إلى مسؤول قسم SG<br>
                سيتم الرد عليك في أقرب وقت عبر البريد الإلكتروني أو الهاتف<br>
                شكراً لاستخدامك خدمتنا ✓
            `;
            chatMessages.appendChild(successDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        })
        .catch(error => {
            const errorDiv = document.createElement('div');
            errorDiv.classList.add('error-message');
            errorDiv.innerHTML = `
                حدث خطأ أثناء إرسال البيانات<br>
                يرجى المحاولة مرة أخرى لاحقاً
            `;
            chatMessages.appendChild(errorDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
        
        // Disable input
        userInput.disabled = true;
        sendBtn.disabled = true;
    }
    
    function sendMessage() {
        const message = userInput.value.trim();
        if (message === '') return;
        
        addUserMessage(message);
        userInput.value = '';
        
        const currentQ = questions[currentQuestion];
        
        // Validate the answer
        if (currentQ.validate && !currentQ.validate(message)) {
            if (currentQ.field === 'password') {
                addErrorMessage("كلمة المرور غير صحيحة");
            } else {
                addErrorMessage("الرجاء إدخال إجابة صحيحة");
            }
            return;
        }
        
        // Store the answer
        if (currentQ.field) {
            userData[currentQ.field] = message;
        }
        
        // Move to next question or finish
        if (currentQuestion < questions.length - 1) {
            setTimeout(() => askQuestion(currentQuestion + 1), 500);
        } else {
            // Form completed
            setTimeout(() => {
                showCompletionMessage();
            }, 1000);
        }
    }
    
    // Event listeners
    sendBtn.addEventListener('click', sendMessage);
    
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Auto-show numeric keyboard for phone input
    userInput.addEventListener('focus', function() {
        if (questions[currentQuestion].inputType === 'tel') {
            this.type = 'tel';
        }
    });
});