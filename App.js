import { StatusBar } from 'expo-status-bar';
import {use, useEffect, useState} from 'react'
import { Image } from 'expo-image'; //React Native Image Orginal Doesn't support remote URL
import { StyleSheet, Text, View ,LogBox} from 'react-native';
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
import { doc, getDoc, setDoc, getFirestore, onSnapshot, collection, addDoc  } from "firebase/firestore";

//Assets
import Poster1 from './assets/bgMapping.jpg'; // Local image for fallback
//SVG - react-native-svg, react-native-svg-transformer, metro.config.js
import ASDLogo from './assets/ASD_Logo.svg'
import CurveDivider from './assets/CurveDivider.svg'
import Line from './assets/line.svg'
import SideBar1 from './assets/sidebar1.svg'
import Footer from './assets/Footer.svg'

LogBox.ignoreAllLogs();

export default function App() {
  //Device ID
  const [firebaseLoggedIn, setFirebaseLoggedIn] = useState(false)
  const [deviceID, setDeviceID] = useState(Application.getAndroidId())
  const [poster,setPoster] = useState()
  const [posterURLs,setPosterURLs] = useState("","","")
  const [lastPosterUpdate, setLastPosterUpdate] = useState("");
  const [posterInfo, setPosterInfo] = useState([{}, {}, {}]); // Store info for 3 posters
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
      console.log("Firebase login Success User Name:", user.displayName, "Last Login:", lastLogin);
      
      //Turn on Heartbeat Agent
     
     // const intervalHeartBeat = setInterval(() => updateHeartBeat(), 300*1000);
      getCurrentPoster();
      
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Firebase login error:", errorCode, errorMessage);
    });
  }

  //updateHeartBeat 
  const updateHeartBeat = async () =>{
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    console.log(timestamp, "Update HeartBeat")
    const docRef = await addDoc(collection(db, "APB_Poster_Heartbeat"), {
      timestamp: timestamp,
      hkdatetime: moment().format('YYYY-MM-DD HH:mm:ss'),
      deviceID: deviceID,
      type: Device.isDevice?"phyical":"virtual",
      posterInfo: posterInfo,
      
    })
  }

  //Get Poster from Firebase
  const getCurrentPoster = async () => {
    console.log(moment().format('YYYY-MM-DD HH:mm:ss')," Get Current Poster");
    const docRef =  doc(db, 'APB_PosterDisplay', 'Poster');
    const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        //console.log("Get Poster Data", docSnap.data());
        const remoteUrls = [docSnap.data().url1, docSnap.data().url2, docSnap.data().url3];
        //console.log("Remote URLs:", remoteUrls);
        // Get stored info from AsyncStorage
        let stored = await AsyncStorage.getItem('posterInfo');
        //console.log("Stored Poster Info:", posterInfo);
        let posterInfo = stored ? JSON.parse(stored) : [{}, {}, {}];
        let localUris = [];
        for (let i = 0; i < remoteUrls.length; i++) {
          const remoteUrl = remoteUrls[i];
          const prevUrl = posterInfo[i]?.url;
          const prevLocalUri = posterInfo[i]?.localUri;
          const lastPosterUpdate = posterInfo[i]?.lastUpdate || "";
          console.log("lastPosterUpdate", lastPosterUpdate);
          // Check if the remote URL is valid
          let localUri = prevLocalUri;
          

          // If URL changed or no local file, download and update
         
          if (remoteUrl && remoteUrl !== prevUrl) {
            console.log("Remote URL changed or no local file, downloading:", remoteUrl);
            try {
              localUri = FileSystem.documentDirectory + `poster${i + 1}.jpg`;
              const downloadResumable = FileSystem.createDownloadResumable(remoteUrl, localUri);
              await downloadResumable.downloadAsync();
              console.log(`Downloaded poster${i + 1} to`, localUri);
              lastPosterUpdate = moment().format('YYYY-MM-DD HH:mm:ss');
            } catch (e) {
              console.error(`Download error for poster${i + 1}:`, e);
              localUri = null;
            }
          }
          localUris.push(localUri);
          setPosterURLs(localUris);
          posterInfo[i] = { url: remoteUrl, localUri , lastPosterUpdate };
          setPosterInfo(posterInfo);
        }
        // Save updated info to AsyncStorage
        await AsyncStorage.setItem('posterInfo', JSON.stringify(posterInfo));
        //console.log("Updated Poster Info:", posterInfo);
        // Optionally, update state to use the first poster
        //console.log("Setting Poster to:", localUris[0]);
        setPoster(localUris[0])
        console.log("Poster URLs:", localUris);
       
        //checkPosterFileSize();
         updateHeartBeat()
      } else {
        console.log("No such document!");
      }         
  }

 useEffect(() => {
     const interval = setInterval(() => getCurrentPoster(), 10 * 60 * 1000); // Fetch every minute
 }, []);

  
  //Route Change Background
  var counter = 0

  useEffect(() => {
    const interval = setInterval(() => {
      console.log("PosterURLs",posterURLs)
      if (posterURLs.length == 3){
        if (counter < posterURLs.length -1 ){
        
        counter = counter + 1
        console.log("PosterIndex",counter)
        //setPosterIndex(counter)
        setPoster(posterURLs[counter])
        }else{
          counter=0
          console.log("PosterIndex",counter)
          setPoster(posterURLs[counter])
        }
      }
    }, changeRate);
    return () => clearInterval(interval);
  }, []);


  
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
          
          {/* (poster)?(<View style={{position:'absolute' , top:30,left:0,borderWidth:5}}><Image source={{uri: poster}} style={{ resizeMode: "contain", width:945,height:2048}}/></View>)
          :(<View style={{position:'absolute' , top:300,left:0,borderWidth:3}}><Image source={Poster1} style={{ resizeMode: "contain", width:945,height:2048}}/></View>) */}
          
          <View style={{position:'absolute',top:0,left:0,borderWidth:0}}><Image source={poster}  style={{ resizeMode: "contain", width:945,height:2048}}/></View>
          <View style={{position:'absolute',bottom:100, right:-250, opacity:1,borderWidth:1}}><Footer width={1400} height={450}/></View>       
        </View>
      </View>
  );
}



