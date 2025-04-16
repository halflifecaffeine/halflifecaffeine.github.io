import { faGavel, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Container, Card, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // Import Link
import { Accordion } from 'react-bootstrap';

const FAQPage: React.FC = () => {
    const faqItems = [
        {
            question: 'What is this application about?',
            answer: 'This application helps you track your caffeine intake and provides useful insights about your consumption habits. This is a superficial app that is not meant to be taken too seriously. It is a fun way to track your caffeine intake and see how it affects you based off of: estimates of caffeine amounts in known drinks, and based on how the average human metabolizes caffeine (although you can tweak that in the Settings page). This is just meant to give you a rough idea of how much caffeine is in your system at any given time.'
        },
        {
            question: 'How do I add a drink?',
            answer: 'Navigate to the "Drinks" page and click on "Add Drink". Fill in the details and save.'
        },
        {
            question: 'What if I don\'t see my drink?',
            answer: 'You can add a custom drink by clicking on "Add Custom Drink" on the "Drinks" page. Enter the name and caffeine content, then save.'
        },
        {
            question: 'Is my data private?',
            answer: 'Yes, your data is stored locally in the `LocalStorage` of this browser instance and is not shared with any third parties.'
        },
        {
            question: 'How can I reset my data?',
            answer: 'Go to the settings page and click on "Reset Data". Please note that this action is irreversible.'
        },
        {
            question: 'Is this data accurate?',
            answer: 'The data is based on average caffeine content in common drinks. Always check the labels for exact amounts. People also metabolize caffeine differently, so the effects may vary. So the estimated amount of caffeine in your system is based on average values and may not be accurate for everyone.'
        },
        {
            question: 'Can I use this app offline?',
            answer: 'Yes, this app is designed to work offline. You can track your intake without an internet connection. In Google Chrome for example, in the right of the address bar you should see an option for "Install App". This will install the app to your device and allow you to use it offline. You can also add it to your home screen on mobile devices. Again, since there is no "backend" or "server" to connect to, you can use this app offline. The only thing that is required is that you have a browser that supports service workers and local storage.'
        },
        {
            question: 'Does this app replace medical advice?',
            answer: 'No, this app is for informational and entertainment purposes only. Always consult a healthcare professional for medical advice.'
        }
    ];

    return (
        <Container className="mt-4">
            <Card>
                <Card.Header>
                    <h1>{<FontAwesomeIcon icon={faInfoCircle} />} FAQ</h1>
                    <p className="text-muted">Frequently Asked Questions</p>
                </Card.Header>
                <Card.Body>

                    <Accordion>
                        {faqItems.map((item, index) => (
                            <Accordion.Item eventKey={index.toString()} key={index}>
                                <Accordion.Header>{item.question}</Accordion.Header>
                                <Accordion.Body>{item.answer}</Accordion.Body>
                            </Accordion.Item>
                        ))}
                    </Accordion>

                </Card.Body>
            </Card>
        </Container>
    );
};

export default FAQPage;
