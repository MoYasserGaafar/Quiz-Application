// ================> Variables Declaration and Selection <================ //
let form = document.querySelector("#quizOptions");
let categoryMenu = document.querySelector("#categoryMenu");
let difficultyOptions = document.querySelector("#difficultyOptions");
let questionsNumber = document.querySelector("#questionsNumber");
let mainBtn = document.querySelector("#startQuiz");

let myRow = document.querySelector(".questions .container .row");

let questions;
let myQuiz;

// ================> Clicking on the <mainBtn> Event <================ //
mainBtn.addEventListener("click", async function () {
//The function passed to the event listener is executed when the button is clicked.
//<async>: Indicates the function uses asynchronous operations, as fetching data.

    //Retrieves the selected value from the elements and stores these values in specified variables.
    let category = categoryMenu.value;
    let difficulty = difficultyOptions.value;
    let number = questionsNumber.value;

    myQuiz = new Quiz(category, difficulty, number)
    //Creates a new object of the <Quiz> class, passing the retrieved values of (category, difficulty, and number) as arguments to the constructor.
    questions = await myQuiz.getAllQuestions();
    //Calls the <getAllQuestions> method of the <myQuiz> object and awaits its result using asynchronous operations and returns a promise.
    //<await>: used to wait for the promise to resolve and store the result in the questions variable.
    console.log(questions);

    //Creating instance from the <Question> class.
    let myQuestion = new Question(0) //Question of index 0
    console.log(myQuestion); //Display Question of index 0

    //Hides the <start-quiz> form to display the questions.
    form.classList.replace("d-flex", "d-none")
    //Replaces the class <d-flex> with the class <d-none> on the form element and hides the form from the user interface.
    myQuestion.display()
    //Calls the display method of the Question class to render the question.
})

// ================> Class to interact with API <================ //
class Quiz {
    constructor(category, difficulty, number) {
        this.category = category
        this.difficulty = difficulty
        this.number = number
        this.score = 0; //Initially set to <0>
    }

    // >>>>> Return URL of API <<<<< //
    getApi() {
        return `https://opentdb.com/api.php?amount=${this.number}&category=${this.category}&difficulty=${this.difficulty}`
        //Returns a string containing the URL for the API endpoint to fetch questions based on the stored (category, difficulty, and number) properties.
    }

    // >>>>> Returns Quiz Questions from API <<<<< //
    async getAllQuestions() {
    //Asynchronous method that calls the <getApi> method to get the API URL.
        let res = await fetch(this.getApi())
        //<fetch(this.getApi())>: Asynchronously fetch data from the constructed URL, awaits the promise from <fetch> and stores the response in a variable.
        let data = await res.json();
        //<res.json()>: Convert the response to JSON format and stores the data in a variable.

        return data.results;
        //Extracts and returns the <results> array from the JSON data, which contains the quiz questions.
    }

    // >>>>> Generating the HTML markup to display the final quiz result to the user <<<<< //
    showResult() {
        //Returns the HTML generated within the template string.
        return `
          <div class="question shadow-lg col-lg-12  p-4 rounded-3 d-flex flex-column justify-content-center align-items-center gap-3">
            <h2 class="mb-0">
            ${
              this.score == this.number
                ? `Congratulations 🎉`
                : `Your score is ${this.score}`
            }
            </h2>
            <button class="again btn btn-primary rounded-pill"><i class="bi bi-arrow-repeat"></i> Try Again</button>
          </div>
        `;
      }
}

// ================> Class to manage individual questions <================ //
class Question {
    constructor(index) {
        this.index = index;
        this.question = questions[index].question;
        this.difficulty = questions[index].difficulty;
        this.correct_answer = questions[index].correct_answer;
        this.incorrect_answers = questions[index].incorrect_answers;
        this.category = questions[index].category;
        this.myAllAnswers = this.getAllQuestions(); //<getAllQuestions()> Method
        this.isAnswered = false;
        //Initializes a flag to track if the question has been answered.
    }

    getAllQuestions() {
    //Creates an array allAnswers containing incorrect answers and the correct answer.
        let allAnswers = [...this.incorrect_answers, this.correct_answer] //Spread operator for array
        allAnswers.sort(); //Sorts the answers alphabetically
        return allAnswers
    }

    display() {
    //display() Method >> Constant >> Variable >> HTML Code
        //Creating a template string that contains the HTML structure for the question card.
        const questionMarkUp = `
          <div class="question shadow-lg col-lg-6 offset-lg-3  p-4 rounded-3 d-flex flex-column justify-content-center align-items-center gap-3 animate__animated animate__bounceIn">
            <div class="w-100 d-flex justify-content-between">
              <span class="btn btn-category"> ${this.category} </span> 
              <span class="fs-6 btn btn-questions"> ${this.index + 1} of ${questions.length} </span>
            </div>
            <h2 class="text-capitalize h4 text-center"> ${this.question} </h2>  
            <ul class="choices w-100 list-unstyled m-0 d-flex flex-wrap text-center">
                ${this.myAllAnswers
                .map((answer) => `<li> ${answer} </li>`)
                .toString() //Coverting array to string
                .replaceAll(",", "") //Replacing commas with empty strings
            }
            </ul>
            <h2 class="text-capitalize text-center score-color h3 fw-bold"><i class="bi bi-emoji-laughing"></i> Score: ${myQuiz.score} </h2>        
          </div>
        `;

        myRow.innerHTML = questionMarkUp;
        //Updates the <innerHTML> of the <myRow> element with the generated HTML, effectively displaying the question and its options on the page.

        let allChoices = document.querySelectorAll(".choices li");
        //Selects all <li> elements within the element with the class <choices> which represents a list of answer choices for a quiz question.

        allChoices.forEach((li) => {
        //Selects all answer choices.
            li.addEventListener("click", () => {
            //Adds a click event listener to each answer choice.
                this.checkAnswer(li);
                //Calls the <checkAnswer> method, passing the clicked <li> element as an argument. 
                //Evaluates the correctness of the chosen answer and updates the UI accordingly.

                this.nextQuestion();
                //Calls the <nextQuestion> method to transition to the next question in the quiz.
            })
        })
    }

    // >>>>> Handling user interactions with answer choices <<<<< //
    checkAnswer(choice) {
    //Checks if the question has already been answered.

        if (!this.isAnswered) { 
        //Condition to prevent selecting more thant one choice
            this.isAnswered = true 
            //Condition is true in the first selection


            if (choice.innerHTML.trim() == this.correct_answer) {
                choice.classList.add("correct", "animate__animated", "animate__pulse")
                myQuiz.score++;
            } else {
                choice.classList.add("wrong", "animate__animated", "animate__shakeX")
            }
        }
    }

    // >>>>> Handling the transition to the next question in the quiz <<<<< //
    nextQuestion() {
        this.index++
        //Increments the <this.index> property, moving to the next question in the <questions> array.

        setTimeout(() => {
        //Creates a delay before executing the callback function to provide a visual pause or animation between questions.
            if (this.index < questions.length) {
            //Checks if the current index is less than the total number of questions. If so, it means there are more questions to display.
                let myNewQuestion = new Question(this.index)
                //Creates a new <Question> object with the updated index, representing the next question.

                myNewQuestion.display()
                //Calls the <display> method of the <myNewQuestion> object to render the next question's content.
            } else {
                let result = myQuiz.showResult();
                //Calls the <showResult> method of the <myQuiz> object to get the final result of the quiz.
                myRow.innerHTML = result;
                //Updates the <innerHTML> of the <myRow> element with the result generated by the <showResult> method, which displays the final score or other relevant information.

                document.querySelector(".question .again").addEventListener("click", function () {
                //Selects the element with the class <question .again> and adds a click event listener to this element.
                    window.location.reload()
                    //Reloads the current page, effectively restarting the quiz.
                })
            }
        }, 2000);
    }
}