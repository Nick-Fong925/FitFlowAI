import { useState } from 'react';
import axios from 'axios';

const ChatGPTComponent = () => {
  const [calories, setCalories] = useState('');
  const [messages, setMessages] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [dietaryrestrictions, setDietaryRestrictions] = useState([]);
  const [newDietaryRestriction, setNewDietaryRestriction] = useState('');
  const [targetCalorieToggle, setTargetCaloriesToggle] = useState(false)

  const openaiApiKey = "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";
  const apiUrl = "https://api.openai.com/v1/chat/completions";
  const model = "gpt-3.5-turbo";
  const temperature = 0.7;
  const maxTokens = 2000;

  const handleCalorieChange = (e) => {
    setCalories(e.target.value);
  };

  const handleNewIngredientChange = (e) => {
    setNewIngredient(e.target.value);
  };

  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setIngredients([...ingredients, newIngredient]);
      setNewIngredient('');
    }
  };

  const handleNewDietaryRestrictionChange = (e) => {
    setNewDietaryRestriction(e.target.value);
  };

  const handleAddDietaryRestriction = () => {
    if (newDietaryRestriction.trim()) {
      setDietaryRestrictions([...dietaryrestrictions, newDietaryRestriction]);
      setNewDietaryRestriction('');
    }
  };

  const parseAPIResponse = (content) => {
    const sections = content.split('\n\n');
  
    const ingredientsSection = sections.find((section) =>
      section.toLowerCase().includes('ingredients:')
    );
  
    const instructionsSection = sections.find((section) =>
      section.toLowerCase().includes('instructions:')
    );
  
    const ingredients = ingredientsSection
      ? ingredientsSection.replace('Ingredients:', '').trim().split('\n')
      : [];
  
    const instructions = instructionsSection
      ? instructionsSection.replace('Instructions:', '').trim().split('\n')
      : [];
  
    return { ingredients, instructions };
  };

  const handleSubmit = async () => {
    if (!calories.trim()) {
      setTargetCaloriesToggle(true);
     return;
    }
  
    // Join ingredients and restrictions arrays into strings separated by commas
    const ingredientsString = ingredients.join(', ');
    const restrictionsString = dietaryrestrictions.join(', ');
    

    // Construct the prompt string with user input
    var prompt = `Generate a recipe which has approximately ${calories} calories, please include ${ingredientsString} and please consider these dietary restrictions ${restrictionsString}. Please ensure that the output will have two distinct sections being Ingredients, and Instructions. Please try to condense the information and enable it to be easily understood, also please ensure that only essential instructions are mentioned. Please also ensure that all ingredients are safe to consume, for example if the ingredients mention danergous chemicals, illegal substances, or inedible objects please ignore.`;
  
    if (dietaryrestrictions == "") {
       prompt = `Generate a recipe which has approximately ${calories} calories, please include ${ingredientsString}. Please ensure that the output will have two distinct sections being Ingredients, and Instructions.Please try to condense the information and enable it to be easily understood, also please ensure that only essential instructions are mentioned. Please also ensure that all ingredients are safe to consume, for example if the ingredients mention danergous chemicals, illegal substances, or inedible objects please ignore.`;
    }

    const userMessage = { role: 'user', content: prompt };

  
    try {
      const response = await axios.post(apiUrl, {
        model,
        messages: [...messages, userMessage], // Include previous messages
        max_tokens: maxTokens,
        temperature,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
        },
      });
  
      const chatGPTMessage = response.data.choices[0].message;
      const { ingredients, instructions } = parseAPIResponse(chatGPTMessage.content);
  
      const gptMessage = {
        role: 'assistant',
        content: { ingredients, instructions },
      };
  
      setMessages([...messages, gptMessage]);
    } catch (error) {
      console.error("Error:", error.message);
    }
  
    setCalories('');
    setIngredients([]);
    setDietaryRestrictions([]);
    setTargetCaloriesToggle(false);
  };

  return (
    <div>
      <div className="flex flex-col">
      <div className="flex ">
        <input
          className="w-40 text-xs border-2 rounded-lg px-5 ml-10 mb-2 text-center font-semibold hover:border-teal-500"
          placeholder={'Desired Calories'}
          type="text"
          value={calories}
          onChange={handleCalorieChange}
        />
          {targetCalorieToggle ? (
        <p className="font-bold text-red-500 text-xs mt-1 ml-2">Target Calories Required</p>
          ) : null}
        </div>
        <div className="flex items-center ml-10 mb-2">
          <input
            className="w-40 text-xs  border-2 rounded-lg px-5 text-center font-semibold hover:border-teal-500 "
            placeholder="Ingredient"
            type="text"
            value={newIngredient}
            onChange={handleNewIngredientChange}
          />
          <button
            className="text-xs text-white font-bold border-lg border w-16 rounded-lg py-1 ml-2 bg-teal-500  hover:bg-teal-600"
            onClick={handleAddIngredient}
          >
            Add
          </button>
        </div>
        <div className="flex items-center ml-10 mb-2">
          <input
            className="w-45 text-xs  border-2  rounded-lg px-10 text-center font-semibold hover:border-teal-500"
            placeholder="Dietary Restriction"
            type="text"
            value={newDietaryRestriction}
            onChange={handleNewDietaryRestrictionChange}
          />
          <button
            className="text-xs text-white font-bold border-lg border w-16 rounded-lg py-1 ml-2 bg-teal-500 hover:bg-teal-600"
            onClick={handleAddDietaryRestriction}
          >
            Add
          </button>
        </div>
        <button
          className="text-xs text-white font-bold border-lg border w-32 rounded-lg py-1 ml-10 bg-teal-500  hover:bg-teal-600"
          onClick={handleSubmit}
        >
          Generate Recipe
        </button>
        <div className="flex ml-10">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="bg-sky-100 border ml-2 px-2 mt-2 rounded-lg text-xs font-semibold">
              {ingredient}
            </div>
          ))}
          {dietaryrestrictions.map((restriction, index) => (
            <div key={index} className="">
              <div className="bg-sky-100 border ml-2 px-2 mt-2 rounded-lg text-xs font-semibold">
                {restriction}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
    
  {messages.map((message, index) => (
    <div
      key={index}
      className={message.role === 'user' ? 'user-message' : 'chatgpt-message'}
    >
      {message.role === 'assistant' ? (
        <div className="ml-10 mt-10 flex flex-row border-4 p-5 max-w-4xl rounded-xl border-teal-500">
          <div> 
            <strong className="text-green-700 text-lg">Ingredients</strong>
            <ul className="text-xs mr-10">
              {message.content.ingredients.map((ingredient, i) => (
                <li className="mt-1 font-semibold" key={i}>{ingredient}</li>
              ))}
            </ul>
          </div>
          <div>
            <strong  className="text-green-700 text-lg">Instructions</strong>
            <ol className="text-xs">
              {message.content.instructions.map((instruction, i) => (
                <li className="mt-1 font-semibold" key={i}>{instruction}</li>
              ))}
            </ol>
          </div>
          <button className="font-semibold text-xs border-2 bg-gray-200 h-5 w-10 rounded-lg">save</button>
        </div>
      ) : (
        message.content
      )}
    </div>
  ))}
</div>
    </div>
  );
};

export default ChatGPTComponent;
