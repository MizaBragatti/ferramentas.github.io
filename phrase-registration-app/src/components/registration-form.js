function RegistrationForm() {
    this.formElement = document.createElement('form');
    this.phraseInput = document.createElement('input');
    this.submitButton = document.createElement('button');

    this.init();
}

RegistrationForm.prototype.init = function() {
    this.phraseInput.type = 'text';
    this.phraseInput.placeholder = 'Enter your phrase';
    this.submitButton.type = 'submit';
    this.submitButton.textContent = 'Register Phrase';

    this.formElement.appendChild(this.phraseInput);
    this.formElement.appendChild(this.submitButton);

    this.formElement.addEventListener('submit', this.handleSubmit.bind(this));
};

RegistrationForm.prototype.handleSubmit = function(event) {
    event.preventDefault();
    const phrase = this.phraseInput.value.trim();

    if (this.validateInput(phrase)) {
        console.log('Phrase registered:', phrase);
        this.phraseInput.value = ''; // Clear input after submission
    } else {
        alert('Please enter a valid phrase.');
    }
};

RegistrationForm.prototype.validateInput = function(phrase) {
    return phrase.length > 0; // Simple validation: non-empty input
};

RegistrationForm.prototype.getFormElement = function() {
    return this.formElement;
};

export default RegistrationForm;