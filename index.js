/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License").
    You may not use this file except in compliance with the License.
    A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file.
    This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
    either express or implied. See the License for the specific language governing permissions and
    limitations under the License.
*/

/**
 * This sample shows how to create a Lambda function for handling Alexa Skill requests that:
 *
 * - Custom slot type: demonstrates using custom slot types to handle a finite set of known values
 *
 * Examples:
 * One-shot model:
 *  User: "Alexa, ask Scale Helper notes in A Major."
 *  Alexa: "(reads back notes in the A major scale)"
 */


const AlexaSkill = require('./AlexaSkill');
const scales = require('./scales');
const properties = require('./properties');

const { APP_ID } = properties;


var HowTo = function () {
  AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
HowTo.prototype = Object.create(AlexaSkill.prototype);
HowTo.prototype.constructor = HowTo;

HowTo.prototype.eventHandlers.onLaunch = (launchRequest, session, response) => {
  const speechText = 'Welcome to Scale Helper. Just name a scale, such as G Melodic Minor. Now, which scale do you want notes for?';
  // If the user either does not reply to the welcome message or says something that is not
  // understood, they will be prompted again with this text.
  const repromptText = 'For instructions on what you can say, please say help me.';
  response.ask(speechText, repromptText);
};
const speechToCard = speechStr => speechStr
  .replace(/ sharp/g, '#')
  .replace(/ay/g, 'a')
  .toUpperCase()
  .replace(/ FLAT/g, 'b');

HowTo.prototype.intentHandlers = {
  GetScale: (intent, session, response) => {
    const scaleSlot = intent.slots.Scale;
    let scaleName;
    if (scaleSlot && scaleSlot.value) {
      scaleName = scaleSlot.value.toLowerCase();
    }
    const patternSlot = intent.slots.Pattern;
    let patternName;
    if (patternSlot && patternSlot.value) {
      patternName = patternSlot.value.toLowerCase();
    }
    const lookup = `${scaleName} ${patternName}`;
    const cardTitle = `Notes for ${lookup}`;
    const scale = scales[lookup];
    let speechOutput;
    let repromptOutput;
    if (scale) {
      speechOutput = {
        speech: `The notes are ${scale}`,
        type: AlexaSkill.speechOutputType.PLAIN_TEXT,
      };
      response.tellWithCard(speechOutput, cardTitle, speechToCard(scale));
    } else {
      let speech = '';
      if (scaleName && patternName) {
        speech = `I currently don't know the notes for ${lookup}. What else can I help with?`;
      } else {
        speech = "Sorry, I didn't understand that. Please try again.";
      }
      speechOutput = {
        speech,
        type: AlexaSkill.speechOutputType.PLAIN_TEXT,
      };
      repromptOutput = {
        speech: 'Name a scale',
        type: AlexaSkill.speechOutputType.PLAIN_TEXT,
      };
      response.ask(speechOutput, repromptOutput);
    }
  },

  'AMAZON.StopIntent': (intent, session, response) => {
    response.tell('See ya');
  },

  'AMAZON.CancelIntent': (intent, session, response) => {
    response.tell('Goodbye');
  },

  'AMAZON.HelpIntent': (intent, session, response) => {
    const speechText = 'Supported scales are major, natural minor, melodic minor, and harmonic minor.'
        + 'For example, just say F melodic minor, or, you can say exit... Now, what can I help you with?';
    const repromptText = 'If you want to hear the options again, just say Help.';
    const speechOutput = {
      speech: speechText,
      type: AlexaSkill.speechOutputType.PLAIN_TEXT,
    };
    const repromptOutput = {
      speech: repromptText,
      type: AlexaSkill.speechOutputType.PLAIN_TEXT,
    };
    response.ask(speechOutput, repromptOutput);
  },
};

exports.handler = (event, context) => {
  const howTo = new HowTo();
  howTo.execute(event, context);
};
