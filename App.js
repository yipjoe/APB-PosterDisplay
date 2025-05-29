import { StatusBar } from 'expo-status-bar';
import {use, useEffect, useState} from 'react'
import { StyleSheet, Text, View ,LogBox, Image} from 'react-native';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import moment from 'moment';

//FireBase
//Add firebaseConfig.js
import { app, auth } from './firebaseConfig';
import { getStorage, ref, getDownloadURL ,uploadBytesResumable, uploadBytes, listAll,deleteObject , ListResult} from "firebase/storage";
import { getAuth, signInWithEmailAndPassword, } from "firebase/auth";
import { doc, getDoc, setDoc, getFirestore,onSnapshot,collection, addDoc  } from "firebase/firestore";

//Assets
import Poster1 from './assets/background.png' 
//SVG - react-native-svg, react-native-svg-transformer, metro.config.js
import ASDLogo from './assets/ASD_Logo.svg'
import CurveDivider from './assets/CurveDivider.svg'
import Line from './assets/line.svg'
import SideBar1 from './assets/sidebar1.svg'
import Footer from './assets/Footer.svg'

//LogBox.ignoreAllLogs();

export default function App() {
  //Device ID
  const [firebaseLoggedIn, setFirebaseLoggedIn] = useState(false)
  const [deviceID, setDeviceID] = useState(Application.getAndroidId())
  const [poster,setPoster] = useState()
  var posterURL=[]
  var changeRate = 5000
  const db = getFirestore();
                                

  
  //Sign In Firebase
    useEffect(() => {
      signIn("virpluz@gmail.com","Virpluz1407!")
     
    }, []);
  
    const signIn = async (email,password) =>{
      //const auth = getAuth(app)// Removed and import from firebaseConfig.js
      await signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        const lastLogin = moment(user.lastLoginAt).format('YYYY-MM-DD HH:mm:ss')
        //console.log(user)
        console.log("Firebase login Success User Name:", user.displayName, "Last Login:", lastLogin);
        updateHeartBeat()
        const intervalHeartBeat = setInterval(() => updateHeartBeat(), 5*60*1000);
        //updateHeartBeat()
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Firebase login error:", errorCode, errorMessage);
      });
    }
    /*
    //Heartbeat Agent
  
    useEffect(() => {
      updateHeartBeat()
      const interval = setInterval(() => updateHeartBeat(), 5*60*1000);
      return () => clearInterval(interval);
    },[])
    */
    
    //updateHeartBeat 
    const updateHeartBeat = async () =>{
      const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
      console.log(timestamp, "Update HeartBeat")
      const docRef = await addDoc(collection(db, "APB_Poster_Heartbeat"), {
        timestamp: timestamp,
        hkdatetime: moment().format('YYYY-MM-DD HH:mm:ss'),
        deviceID: deviceID,
        type: Device.isDevice?"phyical":"virtual",
      })
    }

  /*
    useEffect(() => {
       //getCurrentPoster();
       testGetPoster();
       const interval = setInterval(() => testGetPoster(), 60*1000);
      return () => clearInterval(interval);
    },[]);

    const testGetPoster = async () => {
    //get items from 'APB_PosterDisplay' , "Poster" document
      /*
      const docRef = doc(db, 'APB_PosterDisplay', 'Poster');
      const docSnap = await getDoc(docRef);
      console.log("Get Poster Data",docSnap)
      if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
       
      } else {
        console.log("No such document!");
      }

    }

  // Get Poster
const getCurrentPoster = () => {
  var user = JSON.stringify(getAuth(app));
  if (user) {
    setFirebaseLoggedIn(true);
    console.log("Get Data: Firebase Logged In");
    const unsub = onSnapshot(doc(db, 'APB_PosterDisplay', 'Poster'), async (docSnap) => {
      if (docSnap) {
        const remoteUrls = [docSnap.data().url1, docSnap.data().url2, docSnap.data().url3];
        console.log("Remote URLs:", remoteUrls);
        // Get stored info from AsyncStorage
        let stored = await AsyncStorage.getItem('posterInfo');
        let posterInfo = stored ? JSON.parse(stored) : [{}, {}, {}];
        let localUris = [];

        for (let i = 0; i < remoteUrls.length; i++) {
          const remoteUrl = remoteUrls[i];
          const prevUrl = posterInfo[i]?.url;
          const prevLocalUri = posterInfo[i]?.localUri;

          let localUri = prevLocalUri;

          // If URL changed or no local file, download and update
          if (remoteUrl && remoteUrl !== prevUrl) {
            try {
              localUri = FileSystem.documentDirectory + `poster${i + 1}.jpg`;
              const downloadResumable = FileSystem.createDownloadResumable(remoteUrl, localUri);
              await downloadResumable.downloadAsync();
              console.log(`Downloaded poster${i + 1} to`, localUri);
            } catch (e) {
              console.error(`Download error for poster${i + 1}:`, e);
              localUri = null;
            }
          }

          localUris.push(localUri);
          posterInfo[i] = { url: remoteUrl, localUri };
        }

        // Save updated info to AsyncStorage
        await AsyncStorage.setItem('posterInfo', JSON.stringify(posterInfo));
        // Optionally, update state to use the first poster
        setPoster(localUris[0]);
      }
    });
  } else {
    console.log("Get Data: Firebase Not Logged In");
    signIn("virpluz@gmail.com", "Virpluz1407!");
    setFirebaseLoggedIn(false);
  }
};
  
  //Route Change Background
  var counter = 0

  useEffect(() => {
    const interval = setInterval(() => {
      
   
      if (posterURL.length == 3){
        if (counter < posterURL.length -1 ){
        
        counter = counter + 1
        console.log("PosterIndex",counter)
        //setPosterIndex(counter)
        setPoster(posterURL[counter])
        }else{
          counter=0
          console.log("PosterIndex",counter)
          setPoster(posterURL[counter])
        }
      }
    }, changeRate);
    return () => clearInterval(interval);
  }, []);
*/
  return (
    <View >
        <StatusBar style="disable" hidden={true} />
        <View style={{flex:1, justifyContent:'center', width:'100%'}}>
          <Text style={{position:"absolute", top: 1765, left:10,fontSize:8, color:'black',flexWrap:'wrap'}}>{deviceID}</Text>
          <View style={{position:'absolute' , top:-14,left:96}}><ASDLogo width={130}/></View>
          <View style={{position:'absolute' , top:-12,left:30}}><CurveDivider width={820} height={820*0.3165}/></View>
          <View style={{position:'absolute' , top:64,left:260}}><Text style={{ fontSize:26}}>Architectural Services Department</Text></View>
          <View style={{position:'absolute' , top:70,left:260}}><Line width={400} height={220*0.3165}/></View>
          <View style={{position:'absolute' , top:110,left:260}}><Text style={{fontSize:20}}>Property Services Branch</Text></View>
          <View style={{position:'absolute' , top:-52, right:0}}><SideBar1 width={135} height={135*13}/></View>
          
          {(poster)?(<View style={{position:'absolute' , top:30,left:0,borderWidth:5}}><Image source={{uri: poster}} style={{ resizeMode: "contain", width:945,height:2048}}/></View>)
          :(<View style={{position:'absolute' , top:300,left:0,borderWidth:3}}><Image source={Poster1} style={{ resizeMode: "contain", width:945,height:2048}}/></View>) }
          
          <View style={{position:'absolute' , bottom:100, right:-250, opacity:1,borderWidth:1}}><Footer width={1400} height={450}/></View>       
        </View>
      </View>
  );
}



