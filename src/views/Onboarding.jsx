import React from 'react';
import OnboardingQuiz from '../components/OnboardingQuiz';

const Onboarding = ({ onComplete }) => {
    const handleQuizComplete = (archetype) => {
        localStorage.setItem('userType', archetype);
        localStorage.setItem('onboardingComplete', 'true');

        if (onComplete) {
            onComplete(archetype);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <OnboardingQuiz onComplete={handleQuizComplete} />
        </div>
    );
};

export default Onboarding;
