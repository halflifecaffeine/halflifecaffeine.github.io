import { faExclamationTriangle, faGavel, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Container, Card, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Accordion } from 'react-bootstrap';

/**
 * FAQ item interface with support for React elements in answers
 */
interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

/**
 * Frequently Asked Questions page component
 */
const FAQPage: React.FC = () => {
    const faqItems: FAQItem[] = [
        {
            question: 'What is this application about?',
            answer: (
                <>
                    <p>
                        This application helps you track your caffeine intake and provides useful insights 
                        about your consumption habits. This is a superficial app that is not meant to be 
                        taken too seriously.
                    </p>
                    <p>
                        It is a fun way to track your caffeine intake and see how it affects you based off of:
                    </p>
                    <ul>
                        <li>Estimates of caffeine amounts in known drinks</li>
                        <li>
                            Average human caffeine metabolism rates (which you can customize in 
                            the <Link to="/settings">Settings</Link> page)
                        </li>
                    </ul>
                    <p>
                        This is just meant to give you a rough idea of how much caffeine is in your system 
                        at any given time.
                    </p>
                </>
            )
        },
        {
            question: 'How do I add a drink?',
            answer: (
                <>
                    <p>Navigate to the <Link to="/drinks">Drinks</Link> page and click on the <strong>"Add Drink"</strong> button.</p>
                    <ol>
                        <li>Fill in the details in the form</li>
                        <li>Click "Save" to add it to your collection</li>
                    </ol>
                </>
            )
        },
        {
            question: 'What if I don\'t see my drink?',
            answer: (
                <>
                    <p>
                        You can add a custom drink by clicking on <strong>"Add Drink"</strong> on 
                        the <Link to="/drinks">Drinks</Link> page. Enter the following information:
                    </p>
                    <ul>
                        <li>Brand (manufacturer)</li>
                        <li>Product name</li>
                        <li>Category (coffee, tea, energy drink, etc.)</li>
                        <li>Caffeine content (mg per oz)</li>
                        <li>Default size</li>
                    </ul>
                    <p>Your custom drinks will be saved locally and available for future sessions.</p>
                </>
            )
        },
        {
            question: 'Is my data private?',
            answer: (
                <>
                    <p>
                        <strong>Yes</strong>, your data is stored locally in the <code>LocalStorage</code> of 
                        this browser instance and is not shared with any third parties.
                    </p>
                    <Alert variant="info">
                        Since data is stored in your browser's local storage, clearing your browser data 
                        will also clear your application data.
                    </Alert>
                    <p>
                        You can review our <Link to="/privacy">Privacy Policy</Link> for more details.
                    </p>
                </>
            )
        },
        {
            question: 'How can I reset my data?',
            answer: (
                <>
                    <p>
                        Go to the <Link to="/settings">Settings</Link> page and click on <Button size="sm" variant="danger">Reset Data</Button>.
                    </p>
                    <Alert variant="warning">
                        <strong>Important:</strong> This action is irreversible and will delete all your caffeine intake 
                        records and custom drinks.
                    </Alert>
                </>
            )
        },
        {
            question: 'Is this data accurate?',
            answer: (
                <>
                    <p>
                        Meh, mostly! The data is based on average caffeine content in common drinks. Always check the labels 
                        for exact amounts.
                    </p>
                    <p>
                        Caffeine metabolism varies between individuals based on factors like:
                    </p>
                    <ul>
                        <li>Age</li>
                        <li>Weight</li>
                        <li>Liver function</li>
                        <li>Medication interactions</li>
                        <li>Genetic factors</li>
                    </ul>
                    <p>
                        The estimated amount of caffeine in your system is calculated using average values 
                        and may not be accurate for everyone. We do our best to take realistic caffeine numbers from the drinks you've had, and then calculate the average amount of time it takes to process that caffeine out of your system.
                    </p>
                </>
            )
        },
        {
            question: 'Can I use this app offline?',
            answer: (
                <>
                    <p>
                        <strong>Yes</strong>, this app is designed as a Progressive Web App (PWA) that works offline.
                    </p>
                    <p>To install the app:</p>
                    <ol>
                        <li>
                            In Google Chrome, look for the <strong>"Install"</strong> icon in the address bar
                            <span className="ms-2 text-muted">(Usually appears as a "+" or computer icon)</span>
                        </li>
                        <li>On mobile devices, use the "Add to Home Screen" option from your browser menu</li>
                    </ol>
                    <Alert variant="info">
                        <FontAwesomeIcon icon={faInfoCircle} /> Once installed, you can use the app without an internet connection. All data is stored 
                        locally on your device.
                    </Alert>
                    <p>
                        The app requires a browser that supports service workers and local storage.
                    </p>
                </>
            )
        },
        {
            question: 'Does this app replace medical advice?',
            answer: (
                <>
                    <Alert variant="warning">
                        <strong><FontAwesomeIcon icon={faExclamationTriangle} /> No, this app is for informational and entertainment purposes only.</strong>
                    </Alert>
                    <p>
                        The information provided by this app should not be used to diagnose or treat any 
                        health problems or illness. Always consult a qualified healthcare professional 
                        for medical advice.
                    </p>
                    <p>
                        If you're experiencing adverse effects from caffeine consumption such as:
                    </p>
                    <ul>
                        <li>Heart palpitations</li>
                        <li>Severe anxiety</li>
                        <li>Sleep disorders</li>
                        <li>Digestive issues</li>
                    </ul>
                    <p>Please consult with a medical professional.</p>
                </>
            )
        },
        {
            question: 'Where did you get your data?',
            answer: (
                <>
                    <p>
                        The caffeine content we started from came from:
                    </p>
                    <ul>
                        <li><a href="https://www.caffeineinformer.com/the-caffeine-database" target="_blank">Caffeine Informer's "Caffeine Database"</a></li>
                        <li><a href="https://fdc.nal.usda.gov/download-datasets" target="_blank">The USDA (US Dept of Agriculture) FoodData Datasets</a></li>
                        <li><a href="https://www.nutritionvalue.org/" target="_blank">Nutrition Value</a></li>
                        <li><a href="https://www.webmd.com/" target="_blank">WebMD</a></li>
                    </ul>
                    <p>We did add other metadata, and change the format to suit our needs. If you want to suggest a correction or to add a new item, please <a href="https://github.com/halflifecaffeine/halflifecaffeine.github.io/issues" target="_blank">Open a GitHub Issue</a> and it will be reviewed.</p>
                    </>
            )
        }
    ];

    return (
        <Container className="mt-4">
            <Card>
                <Card.Header>
                    <h1><FontAwesomeIcon icon={faInfoCircle} className="me-2" /> FAQ</h1>
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
