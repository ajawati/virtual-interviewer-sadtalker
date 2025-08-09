// Virtual Interviewer with SadTalker AI Avatar Integration
class VirtualInterviewerWithSadTalker {
    constructor() {
        this.currentQuestionIndex = 0;
        this.sessionStartTime = null;
        this.isRecording = false;
        this.avatarConnected = false;
        this.sessionTimer = null;
        this.isAvatarSpeaking = false;
        this.isGeneratingAvatar = false;
        this.avatarVideoCache = new Map();
        
        // SadTalker configuration
        this.sadTalkerConfig = {
            apiEndpoint: "https://huggingface.co/spaces/vinthony/SadTalker",
            sourceImage: this.getDefaultAvatarImage(),
            settings: {
                enhancer: "gfpgan",
                preprocess: "crop",
                quality: "high",
                face_enhancement: true,
                lip_sync_accuracy: "high"
            }
        };

        // TTS configuration
        this.ttsConfig = {
            voice: 'professional_female',
            rate: 0.9,
            pitch: 1.0,
            language: 'en-US'
        };
        
        // Interview data
        this.questions = [
            {
                id: 1,
                text: "Welcome to your interview! Please tell me about yourself and your professional background.",
                category: "introduction",
                expected_duration: 120,
                avatar_video: null
            },
            {
                id: 2,
                text: "What interests you most about this position and our company?",
                category: "motivation",
                expected_duration: 90,
                avatar_video: null
            },
            {
                id: 3,
                text: "Can you describe a challenging project you've worked on recently and how you overcame the obstacles?",
                category: "problem_solving",
                expected_duration: 150,
                avatar_video: null
            },
            {
                id: 4,
                text: "How do you handle working under pressure and tight deadlines?",
                category: "stress_management",
                expected_duration: 90,
                avatar_video: null
            },
            {
                id: 5,
                text: "Where do you see yourself professionally in the next five years?",
                category: "career_goals",
                expected_duration: 100,
                avatar_video: null
            },
            {
                id: 6,
                text: "What would you consider your greatest professional strengths and areas for improvement?",
                category: "self_assessment",
                expected_duration: 120,
                avatar_video: null
            },
            {
                id: 7,
                text: "Do you have any questions about the role, team, or company culture?",
                category: "candidate_questions",
                expected_duration: 60,
                avatar_video: null
            }
        ];

        this.mockAnalysis = {
            confidence_score: 85,
            speaking_pace: "optimal",
            filler_words: {
                total: 3,
                types: ["um", "uh"],
                percentage: 2.1
            },
            overall_rating: "Excellent",
            recommendations: [
                "Great job maintaining eye contact and professional demeanor",
                "Your responses were well-structured and comprehensive",
                "Consider reducing slight hesitations for even smoother delivery"
            ]
        };

        this.userResponses = [];
    }

    init() {
        console.log('Initializing SadTalker Virtual Interviewer...');
        
        // Initialize immediately if DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupApplication();
            });
        } else {
            this.setupApplication();
        }
    }

    setupApplication() {
        this.bindEvents();
        this.updateConnectionStatus('initializing');
        this.checkSadTalkerAvailability();
        console.log('Application setup complete');
    }

    bindEvents() {
        console.log('Binding events...');
        
        // Use a more robust approach to bind the start button
        this.bindStartButton();
        
        // Interview control events
        const recordBtn = document.getElementById('record-btn');
        if (recordBtn) {
            recordBtn.addEventListener('click', (e) => this.toggleRecording(e));
        }

        const nextBtn = document.getElementById('next-question');
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => this.nextQuestion(e));
        }

        const skipBtn = document.getElementById('skip-question');
        if (skipBtn) {
            skipBtn.addEventListener('click', (e) => this.skipQuestion(e));
        }

        const endBtn = document.getElementById('end-interview');
        if (endBtn) {
            endBtn.addEventListener('click', (e) => this.endInterview(e));
        }

        // Avatar control events
        const muteBtn = document.getElementById('mute-avatar');
        if (muteBtn) {
            muteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleAvatarMute();
            });
        }

        const pauseBtn = document.getElementById('pause-avatar');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleAvatarPause();
            });
        }

        const regenerateBtn = document.getElementById('regenerate-avatar');
        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', (e) => this.regenerateAvatar(e));
        }

        // Results screen events
        const restartBtn = document.getElementById('restart-interview');
        if (restartBtn) {
            restartBtn.addEventListener('click', (e) => this.restartInterview(e));
        }

        const downloadBtn = document.getElementById('download-report');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.downloadReport();
            });
        }

        console.log('All events bound successfully');
    }

    bindStartButton() {
        // Multiple approaches to ensure the start button works
        const startBtn = document.getElementById('start-interview');
        if (startBtn) {
            // Remove any existing listeners
            const newStartBtn = startBtn.cloneNode(true);
            startBtn.parentNode.replaceChild(newStartBtn, startBtn);
            
            // Add event listener
            newStartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Start interview clicked');
                this.startInterview();
            });
            
            // Also add direct click handler
            newStartBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Start interview onclick triggered');
                this.startInterview();
            };
            
            console.log('Start interview button bound successfully');
        } else {
            console.error('Start interview button not found');
        }
    }

    async checkSadTalkerAvailability() {
        console.log('Checking SadTalker API availability...');
        
        try {
            // Simulate API availability check
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.updateConnectionStatus('ready');
            console.log('SadTalker API available');
        } catch (error) {
            console.error('SadTalker API check failed:', error);
            this.updateConnectionStatus('ready'); // Still allow app to work
        }
    }

    updateConnectionStatus(status) {
        const statusIndicator = document.getElementById('connection-status');
        const statusDot = statusIndicator?.querySelector('.status-dot');
        const statusText = statusIndicator?.querySelector('span');

        if (!statusIndicator) return;

        switch (status) {
            case 'initializing':
                statusDot.className = 'status-dot';
                statusText.textContent = 'Initializing...';
                break;
            case 'connecting':
                statusDot.className = 'status-dot';
                statusText.textContent = 'Connecting to SadTalker...';
                break;
            case 'connected':
                statusDot.className = 'status-dot connected';
                statusText.textContent = 'AI Avatar Connected';
                this.avatarConnected = true;
                break;
            case 'ready':
                statusDot.className = 'status-dot connected';
                statusText.textContent = 'Ready to Interview';
                this.avatarConnected = true;
                break;
            case 'error':
                statusDot.className = 'status-dot';
                statusText.textContent = 'SadTalker Unavailable';
                break;
        }
    }

    updateAvatarLoadingProgress(progress, message) {
        const progressFill = document.getElementById('avatar-progress');
        const progressText = document.getElementById('progress-text');
        const loadingMessage = document.getElementById('loading-message');

        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        if (progressText) {
            progressText.textContent = message;
        }
        if (loadingMessage) {
            loadingMessage.textContent = message;
        }
    }

    getDefaultAvatarImage() {
        // Return a base64 encoded professional headshot image or URL
        return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23f8f9fa'/%3E%3Cstop offset='100%25' style='stop-color:%23e9ecef'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='500' fill='url(%23bg)'/%3E%3Ccircle cx='200' cy='160' r='80' fill='%23fdbcb4'/%3E%3Cpath d='M160 120 Q200 100 240 120' stroke='%234a4a4a' stroke-width='4' fill='none'/%3E%3Ccircle cx='180' cy='150' r='8' fill='%23fff'/%3E%3Ccircle cx='220' cy='150' r='8' fill='%23fff'/%3E%3Ccircle cx='180' cy='150' r='4' fill='%234a90e2'/%3E%3Ccircle cx='220' cy='150' r='4' fill='%234a90e2'/%3E%3Cpath d='M185 180 Q200 190 215 180' stroke='%23d4756b' stroke-width='3' fill='none'/%3E%3Crect x='160' y='240' width='80' height='150' fill='%23f8f9fa'/%3E%3Crect x='140' y='240' width='120' height='180' fill='%231a1a2e' rx='20'/%3E%3Cpath d='M200 240 L200 280' stroke='%23dc3545' stroke-width='8'/%3E%3Ctext x='200' y='450' text-anchor='middle' fill='%23333' font-family='Arial' font-size='16' font-weight='bold'%3EProfessional Interviewer%3C/text%3E%3C/svg%3E";
    }

    startInterview() {
        console.log('Starting SadTalker interview...');
        
        // Get screen elements
        const welcomeScreen = document.getElementById('welcome-screen');
        const interviewScreen = document.getElementById('interview-screen');
        
        console.log('Welcome screen element:', welcomeScreen);
        console.log('Interview screen element:', interviewScreen);
        
        if (!welcomeScreen || !interviewScreen) {
            console.error('Required screen elements not found');
            return;
        }
        
        // Hide welcome screen and show interview screen
        welcomeScreen.classList.add('hidden');
        interviewScreen.classList.remove('hidden');
        
        console.log('Screen transition completed');
        console.log('Welcome screen classes:', welcomeScreen.className);
        console.log('Interview screen classes:', interviewScreen.className);
        
        // Update connection status
        this.updateConnectionStatus('connecting');
        
        // Initialize session
        this.sessionStartTime = new Date();
        this.startSessionTimer();
        this.updateProgress();
        this.displayCurrentQuestion();
        
        // Connect and generate first avatar video
        this.connectAvatarAndGenerate();
    }

    async connectAvatarAndGenerate() {
        console.log('Connecting avatar and generating first question...');
        
        this.updateAvatarLoadingProgress(10, 'Connecting to SadTalker API...');
        
        // Simulate SadTalker connection
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.updateAvatarLoadingProgress(30, 'Initializing AI Avatar...');
        
        // Generate avatar video for first question
        try {
            await this.generateAvatarVideo(this.currentQuestionIndex);
            
            // Show avatar display
            const avatarLoading = document.getElementById('avatar-loading');
            const avatarDisplay = document.getElementById('avatar-display');
            
            if (avatarLoading && avatarDisplay) {
                avatarLoading.classList.add('hidden');
                avatarDisplay.classList.remove('hidden');
            }
            
            this.updateConnectionStatus('connected');
            
            // Start first question after a brief delay
            setTimeout(() => {
                this.playAvatarVideo();
            }, 500);
            
        } catch (error) {
            console.error('Failed to generate initial avatar video:', error);
            this.showFallbackAvatar('Failed to connect to SadTalker API. Using fallback mode.');
        }
    }

    async generateAvatarVideo(questionIndex) {
        if (this.isGeneratingAvatar) return;
        
        const question = this.questions[questionIndex];
        const cacheKey = `question_${question.id}`;
        
        // Check cache first
        if (this.avatarVideoCache.has(cacheKey)) {
            console.log(`Using cached avatar video for question ${questionIndex + 1}`);
            question.avatar_video = this.avatarVideoCache.get(cacheKey);
            return question.avatar_video;
        }
        
        this.isGeneratingAvatar = true;
        console.log(`Generating SadTalker video for question ${questionIndex + 1}...`);
        
        try {
            // Show video generation status
            this.showVideoGenerationStatus('Generating avatar response...');
            
            // Step 1: Convert text to speech
            this.updateAvatarLoadingProgress(40, 'Converting text to speech...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Step 2: Generate SadTalker video (simulated)
            this.updateAvatarLoadingProgress(60, 'Generating SadTalker video...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Step 3: Process and cache the video
            this.updateAvatarLoadingProgress(80, 'Processing avatar video...');
            const mockVideoUrl = await this.generateMockVideo(question);
            
            question.avatar_video = mockVideoUrl;
            this.avatarVideoCache.set(cacheKey, mockVideoUrl);
            
            this.updateAvatarLoadingProgress(100, 'Avatar ready!');
            
            console.log(`SadTalker video generated successfully for question ${questionIndex + 1}`);
            return mockVideoUrl;
            
        } catch (error) {
            console.error('Error generating SadTalker video:', error);
            
            // Generate mock video as fallback
            const mockVideoUrl = await this.generateMockVideo(question);
            question.avatar_video = mockVideoUrl;
            this.avatarVideoCache.set(cacheKey, mockVideoUrl);
            
            return mockVideoUrl;
        } finally {
            this.isGeneratingAvatar = false;
            this.hideVideoGenerationStatus();
        }
    }

    async generateMockVideo(question) {
        console.log('Generating mock avatar video...');
        
        // Create a simple video blob URL for demo purposes
        // In real implementation, this would be the actual SadTalker generated video
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 500;
        const ctx = canvas.getContext('2d');
        
        // Create a simple frame
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, 400, 500);
        
        // Draw avatar face
        ctx.fillStyle = '#fdbcb4';
        ctx.beginPath();
        ctx.arc(200, 160, 80, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw mouth
        ctx.fillStyle = '#d4756b';
        ctx.beginPath();
        ctx.ellipse(200, 190, 15, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Convert to blob
        return new Promise(resolve => {
            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                resolve(url);
            }, 'image/png');
        });
    }

    showVideoGenerationStatus(message) {
        const videoStatus = document.getElementById('video-status');
        const statusText = document.getElementById('video-status-text');
        
        if (videoStatus) {
            videoStatus.classList.remove('hidden');
        }
        if (statusText) {
            statusText.textContent = message;
        }
    }

    hideVideoGenerationStatus() {
        const videoStatus = document.getElementById('video-status');
        if (videoStatus) {
            videoStatus.classList.add('hidden');
        }
    }

    showFallbackAvatar(message) {
        const fallbackAvatar = document.getElementById('fallback-avatar');
        const avatarStatus = document.getElementById('current-avatar-status');
        const avatarLoading = document.getElementById('avatar-loading');
        const avatarDisplay = document.getElementById('avatar-display');
        
        // Hide loading and show display
        if (avatarLoading) {
            avatarLoading.classList.add('hidden');
        }
        if (avatarDisplay) {
            avatarDisplay.classList.remove('hidden');
        }
        
        if (fallbackAvatar) {
            fallbackAvatar.style.display = 'flex';
        }
        if (avatarStatus) {
            avatarStatus.textContent = message || 'Using fallback avatar';
        }
        
        // Enable recording after showing fallback
        setTimeout(() => {
            this.handleAvatarVideoEnd();
        }, 2000);
    }

    playAvatarVideo() {
        const question = this.questions[this.currentQuestionIndex];
        const avatarVideo = document.getElementById('avatar-video');
        const fallbackAvatar = document.getElementById('fallback-avatar');
        
        if (question.avatar_video && avatarVideo) {
            // Since we're using image URLs for demo, show fallback with animation
            this.showFallbackAvatar('AI Interviewer speaking question...');
            
            // Simulate video playback duration
            setTimeout(() => {
                this.handleAvatarVideoEnd();
            }, 4000 + Math.random() * 2000); // 4-6 seconds
            
            console.log(`Playing SadTalker video for question ${this.currentQuestionIndex + 1}`);
        } else {
            console.log('No avatar video available, showing fallback');
            this.showFallbackAvatar('Avatar video not available');
            
            // Simulate speaking duration
            setTimeout(() => {
                this.handleAvatarVideoEnd();
            }, 4000);
        }
    }

    handleAvatarVideoEnd() {
        console.log('Avatar video ended, switching to listening mode');
        
        this.updateAvatarStatus('listening');
        this.enableRecording();
    }

    updateAvatarStatus(status) {
        const avatarStatus = document.getElementById('current-avatar-status');
        
        switch (status) {
            case 'speaking':
                if (avatarStatus) avatarStatus.textContent = 'Speaking question...';
                this.isAvatarSpeaking = true;
                break;
            case 'listening':
                if (avatarStatus) avatarStatus.textContent = 'Waiting for your response...';
                this.isAvatarSpeaking = false;
                break;
            case 'generating':
                if (avatarStatus) avatarStatus.textContent = 'Generating next response...';
                this.isAvatarSpeaking = false;
                break;
            default:
                if (avatarStatus) avatarStatus.textContent = 'Ready...';
                this.isAvatarSpeaking = false;
        }
    }

    displayCurrentQuestion() {
        const question = this.questions[this.currentQuestionIndex];
        
        const questionText = document.getElementById('question-text');
        const questionCategory = document.getElementById('question-category');
        const expectedDuration = document.getElementById('expected-duration');
        
        if (questionText) questionText.textContent = question.text;
        if (questionCategory) questionCategory.textContent = question.category.replace('_', ' ');
        if (expectedDuration) expectedDuration.textContent = question.expected_duration;
        
        // Update progress counters
        const currentQuestion = document.getElementById('current-question');
        const totalQuestions = document.getElementById('total-questions');
        
        if (currentQuestion) currentQuestion.textContent = this.currentQuestionIndex + 1;
        if (totalQuestions) totalQuestions.textContent = this.questions.length;
    }

    updateProgress() {
        const progressFill = document.getElementById('progress-fill');
        const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
    }

    startSessionTimer() {
        this.sessionTimer = setInterval(() => {
            if (this.sessionStartTime) {
                const elapsed = new Date() - this.sessionStartTime;
                const minutes = Math.floor(elapsed / 60000);
                const seconds = Math.floor((elapsed % 60000) / 1000);
                
                const sessionTime = document.getElementById('session-time');
                if (sessionTime) {
                    sessionTime.textContent = 
                        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                }
            }
        }, 1000);
    }

    enableRecording() {
        const recordBtn = document.getElementById('record-btn');
        if (recordBtn) {
            recordBtn.disabled = false;
            const recordText = recordBtn.querySelector('.record-text');
            if (recordText) {
                recordText.textContent = 'Click to Record';
            }
        }
    }

    toggleRecording(event) {
        if (event) {
            event.preventDefault();
        }
        
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }

    startRecording() {
        console.log('Starting recording...');
        this.isRecording = true;
        
        const recordBtn = document.getElementById('record-btn');
        const audioViz = document.getElementById('audio-viz');
        
        if (recordBtn) {
            recordBtn.classList.add('recording');
            const recordText = recordBtn.querySelector('.record-text');
            if (recordText) {
                recordText.textContent = 'Recording...';
            }
        }
        
        if (audioViz) {
            audioViz.classList.remove('hidden');
        }
        
        // Simulate recording duration
        const recordingDuration = Math.random() * 30000 + 15000;
        
        setTimeout(() => {
            if (this.isRecording) {
                this.stopRecording();
            }
        }, recordingDuration);
    }

    stopRecording() {
        console.log('Stopping recording...');
        this.isRecording = false;
        
        const recordBtn = document.getElementById('record-btn');
        const audioViz = document.getElementById('audio-viz');
        const transcription = document.getElementById('transcription');
        const nextBtn = document.getElementById('next-question');
        
        if (recordBtn) {
            recordBtn.classList.remove('recording');
            const recordText = recordBtn.querySelector('.record-text');
            if (recordText) {
                recordText.textContent = 'Record Again';
            }
        }
        
        if (audioViz) {
            audioViz.classList.add('hidden');
        }
        
        // Show transcription
        this.showTranscription();
        if (transcription) {
            transcription.classList.remove('hidden');
        }
        
        // Enable next question button
        if (nextBtn) {
            nextBtn.disabled = false;
        }
        
        // Save response
        this.userResponses.push({
            questionId: this.questions[this.currentQuestionIndex].id,
            response: this.generateMockTranscription(),
            timestamp: new Date()
        });
    }

    showTranscription() {
        const transcriptionText = document.getElementById('transcription-text');
        if (!transcriptionText) return;
        
        const mockResponse = this.generateMockTranscription();
        
        // Simulate typing effect
        transcriptionText.textContent = '';
        let i = 0;
        const typeInterval = setInterval(() => {
            if (i < mockResponse.length) {
                transcriptionText.textContent += mockResponse.charAt(i);
                i++;
            } else {
                clearInterval(typeInterval);
            }
        }, 50);
    }

    generateMockTranscription() {
        const responses = [
            "Thank you for that question. I have over five years of experience in software development, primarily working with React and Node.js. I'm passionate about creating user-friendly applications and have led several successful projects in my current role.",
            "I'm particularly excited about this opportunity because it aligns perfectly with my career goals in full-stack development. The company's commitment to innovation and the collaborative team environment really appeal to me.",
            "One of the most challenging projects I worked on was developing a real-time dashboard for our client. We faced integration issues with multiple APIs, but I collaborated with the team to implement a robust solution using microservices architecture.",
            "I work well under pressure by prioritizing tasks, breaking down complex problems into manageable steps, and maintaining clear communication with my team. I've successfully delivered multiple projects under tight deadlines.",
            "In five years, I see myself in a senior technical leadership role, mentoring junior developers and contributing to architectural decisions. I'm committed to continuous learning and staying current with emerging technologies.",
            "My greatest strength is my ability to solve complex problems systematically. As for areas of improvement, I'm working on enhancing my public speaking skills and have been attending workshops to build confidence in presentations.",
            "Yes, I'd like to know more about the team dynamics and the typical project lifecycle here. What opportunities are there for professional development and learning new technologies?"
        ];
        
        return responses[this.currentQuestionIndex] || "Thank you for that question. I believe my experience and skills make me a strong candidate for this position.";
    }

    async nextQuestion(event) {
        if (event) {
            event.preventDefault();
        }
        
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.displayCurrentQuestion();
            this.updateProgress();
            this.resetRecordingUI();
            
            // Update status to generating
            this.updateAvatarStatus('generating');
            
            // Generate avatar video for next question
            try {
                await this.generateAvatarVideo(this.currentQuestionIndex);
                
                // Play the next question
                setTimeout(() => {
                    this.playAvatarVideo();
                }, 1000);
                
            } catch (error) {
                console.error('Error generating next avatar video:', error);
                this.showFallbackAvatar('Failed to generate next question video');
                
                // Enable recording anyway after a delay
                setTimeout(() => {
                    this.handleAvatarVideoEnd();
                }, 3000);
            }
        } else {
            this.completeInterview();
        }
    }

    skipQuestion(event) {
        if (event) {
            event.preventDefault();
        }
        
        // Save empty response
        this.userResponses.push({
            questionId: this.questions[this.currentQuestionIndex].id,
            response: '[Skipped]',
            timestamp: new Date()
        });
        
        this.nextQuestion();
    }

    resetRecordingUI() {
        const recordBtn = document.getElementById('record-btn');
        const audioViz = document.getElementById('audio-viz');
        const transcription = document.getElementById('transcription');
        const nextBtn = document.getElementById('next-question');
        
        if (recordBtn) {
            recordBtn.classList.remove('recording');
            const recordText = recordBtn.querySelector('.record-text');
            if (recordText) {
                recordText.textContent = 'Wait for question...';
            }
            recordBtn.disabled = true;
        }
        
        if (audioViz) {
            audioViz.classList.add('hidden');
        }
        
        if (transcription) {
            transcription.classList.add('hidden');
        }
        
        if (nextBtn) {
            nextBtn.disabled = true;
        }
        
        this.isRecording = false;
    }

    toggleAvatarMute() {
        const muteBtn = document.getElementById('mute-avatar');
        const avatarVideo = document.getElementById('avatar-video');
        
        if (!muteBtn) return;
        
        const icon = muteBtn.querySelector('i');
        if (!icon) return;
        
        if (icon.classList.contains('fa-volume-up')) {
            icon.className = 'fas fa-volume-mute';
            muteBtn.title = 'Unmute Avatar';
            if (avatarVideo) avatarVideo.muted = true;
        } else {
            icon.className = 'fas fa-volume-up';
            muteBtn.title = 'Mute Avatar';
            if (avatarVideo) avatarVideo.muted = false;
        }
    }

    toggleAvatarPause() {
        const pauseBtn = document.getElementById('pause-avatar');
        const avatarVideo = document.getElementById('avatar-video');
        
        if (!pauseBtn) return;
        
        const icon = pauseBtn.querySelector('i');
        if (!icon) return;
        
        if (icon.classList.contains('fa-pause')) {
            icon.className = 'fas fa-play';
            pauseBtn.title = 'Resume Avatar';
            if (avatarVideo) avatarVideo.pause();
        } else {
            icon.className = 'fas fa-pause';
            pauseBtn.title = 'Pause Avatar';
            if (avatarVideo) avatarVideo.play();
        }
    }

    async regenerateAvatar(event) {
        if (event) {
            event.preventDefault();
        }
        
        if (this.isGeneratingAvatar) return;
        
        console.log('Regenerating avatar video...');
        
        // Clear cache for current question
        const question = this.questions[this.currentQuestionIndex];
        const cacheKey = `question_${question.id}`;
        
        if (this.avatarVideoCache.has(cacheKey)) {
            const oldUrl = this.avatarVideoCache.get(cacheKey);
            URL.revokeObjectURL(oldUrl);
            this.avatarVideoCache.delete(cacheKey);
        }
        
        // Show generation status
        this.updateAvatarStatus('generating');
        this.showVideoGenerationStatus('Regenerating avatar response...');
        
        try {
            await this.generateAvatarVideo(this.currentQuestionIndex);
            this.playAvatarVideo();
        } catch (error) {
            console.error('Error regenerating avatar video:', error);
            this.showFallbackAvatar('Failed to regenerate avatar video');
        }
    }

    completeInterview() {
        // Stop session timer
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
        }
        
        // Hide interview screen and show results
        const interviewScreen = document.getElementById('interview-screen');
        const resultsScreen = document.getElementById('results-screen');
        
        if (interviewScreen) {
            interviewScreen.classList.add('hidden');
        }
        if (resultsScreen) {
            resultsScreen.classList.remove('hidden');
        }
        
        // Display results
        this.displayResults();
    }

    endInterview(event) {
        if (event) {
            event.preventDefault();
        }
        
        if (confirm('Are you sure you want to end the interview? Your progress will be saved.')) {
            this.completeInterview();
        }
    }

    displayResults() {
        // Update result values
        const confidenceScore = document.getElementById('confidence-score');
        const speakingPace = document.getElementById('speaking-pace');
        const fillerPercentage = document.getElementById('filler-percentage');
        const overallRating = document.getElementById('overall-rating');
        
        if (confidenceScore) confidenceScore.textContent = this.mockAnalysis.confidence_score;
        if (speakingPace) speakingPace.textContent = this.mockAnalysis.speaking_pace;
        if (fillerPercentage) fillerPercentage.textContent = this.mockAnalysis.filler_words.percentage;
        if (overallRating) overallRating.textContent = this.mockAnalysis.overall_rating;
        
        // Display recommendations
        const recommendationsList = document.getElementById('recommendations-list');
        if (recommendationsList) {
            recommendationsList.innerHTML = '';
            
            this.mockAnalysis.recommendations.forEach(recommendation => {
                const recommendationItem = document.createElement('div');
                recommendationItem.className = 'recommendation-item';
                recommendationItem.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    <p>${recommendation}</p>
                `;
                recommendationsList.appendChild(recommendationItem);
            });
        }
        
        // Add fade-in animation
        const resultsScreen = document.getElementById('results-screen');
        if (resultsScreen) {
            resultsScreen.classList.add('fade-in');
        }
    }

    restartInterview(event) {
        if (event) {
            event.preventDefault();
        }
        
        // Reset all state
        this.currentQuestionIndex = 0;
        this.sessionStartTime = null;
        this.isRecording = false;
        this.userResponses = [];
        this.isAvatarSpeaking = false;
        this.isGeneratingAvatar = false;
        
        // Clear avatar cache
        this.avatarVideoCache.forEach(url => URL.revokeObjectURL(url));
        this.avatarVideoCache.clear();
        
        // Reset questions
        this.questions.forEach(q => {
            if (q.avatar_video) {
                URL.revokeObjectURL(q.avatar_video);
                q.avatar_video = null;
            }
        });
        
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
            this.sessionTimer = null;
        }
        
        // Hide results and show welcome screen
        const resultsScreen = document.getElementById('results-screen');
        const welcomeScreen = document.getElementById('welcome-screen');
        
        if (resultsScreen) {
            resultsScreen.classList.add('hidden');
        }
        if (welcomeScreen) {
            welcomeScreen.classList.remove('hidden');
        }
        
        // Reset UI elements
        this.resetRecordingUI();
        this.updateConnectionStatus('ready');
        
        // Reset session timer display
        const sessionTime = document.getElementById('session-time');
        if (sessionTime) {
            sessionTime.textContent = '00:00';
        }
    }

    downloadReport() {
        // Generate report with SadTalker integration info
        const sessionTime = document.getElementById('session-time');
        const reportData = {
            interviewDate: new Date().toLocaleDateString(),
            sessionDuration: sessionTime ? sessionTime.textContent : '00:00',
            questionsAnswered: this.userResponses.length,
            totalQuestions: this.questions.length,
            sadTalkerIntegration: {
                videosGenerated: this.avatarVideoCache.size,
                apiStatus: this.avatarConnected ? 'Connected' : 'Disconnected'
            },
            analysis: this.mockAnalysis,
            responses: this.userResponses
        };
        
        // Create and download JSON file
        const dataStr = JSON.stringify(reportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `sadtalker-interview-report-${new Date().toISOString().split('T')[0]}.json`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show download confirmation
        const btn = document.getElementById('download-report');
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Downloaded!';
            btn.disabled = true;
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 2000);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing SadTalker Virtual Interviewer...');
    
    const app = new VirtualInterviewerWithSadTalker();
    app.init();
    
    // Make app available globally for video event handlers
    window.interviewApp = app;
    
    // Add development logs
    console.log('🎭 Virtual Interviewer with SadTalker AI initialized');
    console.log('🤖 SadTalker integration ready');
    console.log('📹 AI avatar video generation enabled');
    console.log('📋 Interview questions loaded:', app.questions.length);
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Space bar to toggle recording
        if (e.code === 'Space' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            const recordBtn = document.getElementById('record-btn');
            if (recordBtn && !recordBtn.disabled) {
                recordBtn.click();
            }
        }
        
        // Enter to go to next question
        if (e.code === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            const nextBtn = document.getElementById('next-question');
            if (nextBtn && !nextBtn.disabled) {
                nextBtn.click();
            }
        }
        
        // R key to regenerate avatar
        if (e.code === 'KeyR' && e.ctrlKey) {
            e.preventDefault();
            const regenerateBtn = document.getElementById('regenerate-avatar');
            if (regenerateBtn && !regenerateBtn.disabled) {
                regenerateBtn.click();
            }
        }
    });
    
    // Add helpful console commands for development
    console.log('💡 Development tip: Access app instance via window.interviewApp');
    console.log('🎬 SadTalker controls: generateAvatarVideo(), playAvatarVideo(), regenerateAvatar()');
    console.log('⌨️  Keyboard shortcuts: Space (record), Ctrl+Enter (next), Ctrl+R (regenerate)');
});