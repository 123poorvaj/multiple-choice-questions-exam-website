// Application state
let currentRole = null;
let questions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let testStarted = false;

// DOM elements
const roleSelection = document.getElementById('roleSelection');
const headerTitle = document.getElementById('headerTitle');
const switchRoleBtn = document.getElementById('switchRoleBtn');
const teacherBtn = document.getElementById('teacherBtn');
const studentBtn = document.getElementById('studentBtn');
const teacherBlock = document.getElementById('teacherBlock');
const studentBlock = document.getElementById('studentBlock');
const questionForm = document.getElementById('questionForm');
const questionsList = document.getElementById('questionsList');
const questionCount = document.getElementById('questionCount');
const startTestBtn = document.getElementById('startTestBtn');
const testContainer = document.getElementById('testContainer');
const resultsContainer = document.getElementById('resultsContainer');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  showRoleSelection();
  loadQuestions();
  updateQuestionCount();
  setupEventListeners();
});

// Event listeners setup
function setupEventListeners() {
  // Role selection and switching
  switchRoleBtn.addEventListener('click', showRoleSelection);
  
  // Navigation
  teacherBtn.addEventListener('click', () => switchTab('teacher'));
  studentBtn.addEventListener('click', () => switchTab('student'));
  
  // Teacher form
  questionForm.addEventListener('submit', handleQuestionSubmit);
  
  // Student test
  startTestBtn.addEventListener('click', startTest);
  document.getElementById('prevBtn').addEventListener('click', previousQuestion);
  document.getElementById('nextBtn').addEventListener('click', nextQuestion);
  document.getElementById('submitTestBtn').addEventListener('click', submitTest);
  document.getElementById('retakeTestBtn').addEventListener('click', retakeTest);
}

// Role selection functionality
function showRoleSelection() {
  roleSelection.style.display = 'flex';
  document.querySelector('.header').style.display = 'none';
  document.querySelector('.main').style.display = 'none';
  currentRole = null;
}

function selectRole(role) {
  currentRole = role;
  roleSelection.style.display = 'none';
  document.querySelector('.header').style.display = 'block';
  document.querySelector('.main').style.display = 'block';
  
  if (role === 'teacher') {
    headerTitle.textContent = 'Teacher Portal - MCQ Exam Platform';
    switchTab('teacher');
    document.querySelector('.nav').classList.add('hidden');
  } else {
    headerTitle.textContent = 'Student Portal - MCQ Exam Platform';
    switchTab('student');
    document.querySelector('.nav').classList.add('hidden');
  }
}

// Tab switching
function switchTab(tab) {
  if (tab === 'teacher') {
    teacherBtn.classList.add('active');
    studentBtn.classList.remove('active');
    teacherBlock.classList.add('active');
    studentBlock.classList.remove('active');
  } else {
    studentBtn.classList.add('active');
    teacherBtn.classList.remove('active');
    studentBlock.classList.add('active');
    teacherBlock.classList.remove('active');
  }
}

// Teacher functionality
function handleQuestionSubmit(e) {
  e.preventDefault();
  
  const questionText = document.getElementById('questionText').value.trim();
  const options = [
    document.getElementById('option1').value.trim(),
    document.getElementById('option2').value.trim(),
    document.getElementById('option3').value.trim(),
    document.getElementById('option4').value.trim()
  ];
  
  const correctAnswer = document.querySelector('input[name="correctAnswer"]:checked');
  
  if (!questionText || options.some(opt => !opt) || !correctAnswer) {
    alert('Please fill in all fields and select the correct answer.');
    return;
  }
  
  const question = {
    id: Date.now(),
    question: questionText,
    options: options,
    correctAnswer: parseInt(correctAnswer.value)
  };
  
  questions.push(question);
  saveQuestions();
  displayQuestions();
  updateQuestionCount();
  questionForm.reset();
  
  // Show success message
  showNotification('Question added successfully!', 'success');
}

function displayQuestions() {
  if (questions.length === 0) {
    questionsList.innerHTML = '<p class="no-questions">No questions added yet.</p>';
    return;
  }
  
  questionsList.innerHTML = questions.map(q => `
    <div class="question-item">
      <h4>${q.question}</h4>
      <ul class="question-options">
        ${q.options.map((option, index) => `
          <li class="${index === q.correctAnswer ? 'correct' : ''}">
            ${String.fromCharCode(65 + index)}. ${option}
            ${index === q.correctAnswer ? ' ✓' : ''}
          </li>
        `).join('')}
      </ul>
      <button onclick="deleteQuestion(${q.id})" class="btn btn-secondary" style="margin-top: 1rem; padding: 0.5rem 1rem; font-size: 0.9rem;">Delete</button>
    </div>
  `).join('');
}

function deleteQuestion(id) {
  if (confirm('Are you sure you want to delete this question?')) {
    questions = questions.filter(q => q.id !== id);
    saveQuestions();
    displayQuestions();
    updateQuestionCount();
    showNotification('Question deleted successfully!', 'success');
  }
}

function updateQuestionCount() {
  const count = questions.length;
  questionCount.textContent = `${count} question${count !== 1 ? 's' : ''} available`;
  startTestBtn.disabled = count === 0;
}

// Student functionality
function startTest() {
  if (questions.length === 0) {
    alert('No questions available. Please ask your teacher to add some questions.');
    return;
  }
  
  testStarted = true;
  currentQuestionIndex = 0;
  userAnswers = new Array(questions.length).fill(null);
  
  testContainer.classList.remove('hidden');
  resultsContainer.classList.add('hidden');
  startTestBtn.style.display = 'none';
  
  displayCurrentQuestion();
  updateTestProgress();
}

function displayCurrentQuestion() {
  const question = questions[currentQuestionIndex];
  const displayQuestion = document.getElementById('displayQuestion');
  const optionsDisplay = document.getElementById('optionsDisplay');
  
  displayQuestion.textContent = question.question;
  
  optionsDisplay.innerHTML = question.options.map((option, index) => `
    <div class="option-item ${userAnswers[currentQuestionIndex] === index ? 'selected' : ''}" 
         onclick="selectOption(${index})">
      <input type="radio" name="currentAnswer" value="${index}" 
             ${userAnswers[currentQuestionIndex] === index ? 'checked' : ''}>
      <label>${String.fromCharCode(65 + index)}. ${option}</label>
    </div>
  `).join('');
  
  updateNavigationButtons();
}

function selectOption(optionIndex) {
  userAnswers[currentQuestionIndex] = optionIndex;
  displayCurrentQuestion();
}

function updateTestProgress() {
  document.getElementById('currentQuestion').textContent = `Question ${currentQuestionIndex + 1}`;
  document.getElementById('totalQuestions').textContent = `of ${questions.length}`;
}

function updateNavigationButtons() {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const submitBtn = document.getElementById('submitTestBtn');
  
  prevBtn.disabled = currentQuestionIndex === 0;
  
  if (currentQuestionIndex === questions.length - 1) {
    nextBtn.classList.add('hidden');
    submitBtn.classList.remove('hidden');
  } else {
    nextBtn.classList.remove('hidden');
    submitBtn.classList.add('hidden');
    nextBtn.disabled = userAnswers[currentQuestionIndex] === null;
  }
}

function previousQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    displayCurrentQuestion();
    updateTestProgress();
  }
}

function nextQuestion() {
  if (currentQuestionIndex < questions.length - 1 && userAnswers[currentQuestionIndex] !== null) {
    currentQuestionIndex++;
    displayCurrentQuestion();
    updateTestProgress();
  }
}

function submitTest() {
  // Check if all questions are answered
  const unanswered = userAnswers.findIndex(answer => answer === null);
  if (unanswered !== -1) {
    alert(`Please answer question ${unanswered + 1} before submitting.`);
    currentQuestionIndex = unanswered;
    displayCurrentQuestion();
    updateTestProgress();
    return;
  }
  
  showResults();
}

function showResults() {
  testContainer.classList.add('hidden');
  resultsContainer.classList.remove('hidden');
  
  // Calculate score
  let correctAnswers = 0;
  questions.forEach((question, index) => {
    if (userAnswers[index] === question.correctAnswer) {
      correctAnswers++;
    }
  });
  
  const percentage = Math.round((correctAnswers / questions.length) * 100);
  
  // Display score
  const scoreDisplay = document.getElementById('scoreDisplay');
  scoreDisplay.innerHTML = `
    <h3>Your Score: ${correctAnswers}/${questions.length}</h3>
    <p>${percentage}% Correct</p>
    <p class="score-message">${getScoreMessage(percentage)}</p>
  `;
  
  // Display detailed review
  displayAnswersReview();
}

function displayAnswersReview() {
  const answersReview = document.getElementById('answersReview');
  
  answersReview.innerHTML = `
    <h4 style="margin-bottom: 1rem; color: #2d3748;">Detailed Review:</h4>
    ${questions.map((question, index) => {
      const userAnswer = userAnswers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      
      return `
        <div class="review-question">
          <h4>Question ${index + 1}: ${question.question}</h4>
          <div class="review-options">
            ${question.options.map((option, optIndex) => {
              let className = '';
              if (optIndex === question.correctAnswer) {
                className = 'correct';
              } else if (optIndex === userAnswer && !isCorrect) {
                className = 'user-incorrect';
              }
              
              return `
                <div class="review-option ${className}">
                  ${String.fromCharCode(65 + optIndex)}. ${option}
                  ${optIndex === question.correctAnswer ? ' ✓ (Correct Answer)' : ''}
                  ${optIndex === userAnswer && !isCorrect ? ' ✗ (Your Answer)' : ''}
                  ${optIndex === userAnswer && isCorrect ? ' ✓ (Your Answer)' : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('')}
  `;
}

function getScoreMessage(percentage) {
  if (percentage >= 90) return 'Excellent work! 🎉';
  if (percentage >= 80) return 'Great job! 👏';
  if (percentage >= 70) return 'Good effort! 👍';
  if (percentage >= 60) return 'Keep practicing! 📚';
  return 'Don\'t give up, try again! 💪';
}

function retakeTest() {
  testStarted = false;
  currentQuestionIndex = 0;
  userAnswers = [];
  
  resultsContainer.classList.add('hidden');
  startTestBtn.style.display = 'inline-block';
}

// Utility functions
function saveQuestions() {
  localStorage.setItem('mcq_questions', JSON.stringify(questions));
}

function loadQuestions() {
  const saved = localStorage.getItem('mcq_questions');
  if (saved) {
    questions = JSON.parse(saved);
    displayQuestions();
  }
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: ${type === 'success' ? '#48bb78' : '#4299e1'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  
  .score-message {
    font-size: 1.1rem;
    font-weight: 600;
    margin-top: 0.5rem;
  }
`;
document.head.appendChild(style);

// Make deleteQuestion available globally
window.deleteQuestion = deleteQuestion;
window.selectOption = selectOption;
window.selectRole = selectRole;