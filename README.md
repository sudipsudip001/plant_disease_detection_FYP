**Plant Disease Detection FYP(Final Year Project)**

This repository contains the code for frontend, backend and model notebooks for the Final Year Project as part of our Computer Science Degree. The frontend application was made in `React Native using expo` and the backend in `Fast API`. We specifically used `Tensorflow` and
`Tensorflow Hub` for model creation and transfer learning respectively.

Our main objective for the project was to make the plant disease detection easier and accessible for farmers using mobile devices. Annually, 20-40% of the global crops go wasted which causes farmer to bear heavy loss and thus, in order to mitigate and minimize it, timely
detection and treatment becomes crucial. Our project aimed at providing timely recognition of disease as a right rather than a luxury in order to help farmers in an agricultural country like ours.

In the preliminary phase we have three plants to predict the disease from, namely `Potato`, `Tomato` and `Pepper`. The plants were chosen based on the availability of data, which was taken from ['PlantVillage' dataset](https://github.com/spMohanty/PlantVillage-Dataset). There
were 2 classes for Pepper, 3 classes for Potato and 10 classes to predict from Tomato as can be seen from the dataset. Along with the plant disease predition using CNN, we also used a model created from `Transfer Learning` in order to classify the initially inputed image of
whether it is a leaf or not. Besides this image classification task, we also integrated the use of LLM through `Ollama` that provided access to the `LLAMA 3.2 3B` model for the users to chat or know details about the predicted output. And one of the most attractive UI feature
of the project was the use of `SSE(Server Sent Events)` which allowed us to generate a *ChatGPT like(continuous)* response in the UI.

In the prediction part, we were able to achieve a significant accuracy levels for the plants which were thus measured using the Confusion matrix. The accuracies were *99% for pepper*, *95% for potato* and *92% for tomato* as of January 29, 2025. The workflow was pretty smooth
and functional as well though much improvements would be required for it to become a fully fledged real world mobile application. To talk about the CNN model, we used a VGG (Visual Geometry Group) like architecture in our model training process. Altogether 6 layers were formed
with each layer constituting a Convolutional layer of filter size 3\*3 and Maxpooling layer of size 2\*2. Finally the layers are flattened and a Dense layer is used in the output to classify models according to their number of classes.

For transfer learning we used the procedures from the official [Tensorflow_hub](https://www.tensorflow.org/tutorials/images/transfer_learning_with_hub). This was used in order to classify datasets for initial leaf or non-leaf categorization.

In order to make it run on your system, here are some important tips after you clone the repository in your local machine:
1. Clone the repository: `git clone https://github.com/sudipsudip001/plant_disease_detection_FYP.git`
2. `cd plant_disease_detection_FYP`
3. For backend
   - Navigate to the backend repository in terminal, using `cd backend`.
   - Create a virtual environment or directly install all the requirements in your default environment using `pip install -r requirements.txt` command.
   - Use the command `uvicorn main:app --host 0.0.0.0 --port 8000 --reload` to run the backend server.
4. For frontend
   - Navigate to your frontend repository using, `cd..` followed by `cd frontend` command.
   - `npm install`
   - Open command prompt. Type in ipconfig and copy the IP address of IPV4 and change the ip addresses in: Upload.js and Consults.js (for variable val). Change the middle ip address i.e. `192.168.1.57` part of the var variable.
   - Use npm start to run the application and press 'w' or 'a' or others according to the device that you want to open. Please check expo documentation for more details.
5. Run Ollama application in your device as well to run the chat interface.

*Note: Make sure you run your server(backend application) before you run your frontend in order to avoid any potential errors.*

Some of the works that need to be done are mentioned as follows:

- [ ] Make the application work in offline mode using Cache detection models & FAQs for offline use.
- [ ] Add Plant Care tracker, which is a simple calendar based reminders for watering, fertilizing, etc.
- [ ] Add authentication and sign in features along with global chat system that also allows sharing of captured images/videos for troubleshooting and information sharing.
- [ ] Add voice-to-text input for hands-free usage or using the mobile application for illiterate people.
- [ ] Highlight the affected area of plant and improve the accuracy of prediction.

Overall this was my first mobile app project and gave in some insights into mobile application development in general. Here's a link to the demonstration [video of the application](https://youtu.be/-vwPAobbybs).
