import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  StyleSheet, View, Text, Image, ScrollView,
  TextInput, TouchableOpacity, KeyboardAvoidingView
} from 'react-native';
import firebase from '../config/firebase';
import api from '../services/axios';
import axios from 'axios';
import Footer from './footer';

import styles from './styles';

import logoIconWhite from '../assets/img/logoIconWhite.png'
import btnArrowLeft from '../assets/img/btnArrowLeft.png'
import Room from '../Room';


export default function Chat(props) {

  const [user, setUser] = useState(null)
  const [mensagens, setMensagens] = useState([])
  const [caixaTexto, setCaixaTexto] = useState('')
  const [scrollview, setScrollview] = useState('')
  const [savePicture, setSavePicture] = useState('')
  const [closeModal, setCloseModal] = useState(false)


  const db = firebase.firestore()

  const salvar = () => {
    api.post('/sendMessage', {
      mensagem: caixaTexto,
      user: user.name,
      profilePic: user.picture,
      imagem: savePicture,
    })
      .then(function () {
        // setMensagens([...mensagens, caixaTexto])
        setCaixaTexto('')
        scrollview.scrollToEnd({ animated: true })
        
      }).catch(function () {

      })
        setCloseModal(false)
        setCaixaTexto("")
        setSavePicture(null)
  }

  useEffect (()=>{
    // if(savePicture===null){setCloseModal(true)}
    
  },[savePicture])
  console.log(closeModal)

  console.log(savePicture)

  useEffect(() => {
    carregaUsuarioAnonimo()
    let mensagens_enviadas = []
    const unsubscribe = db.collection("chat")
      .doc("sala_1").collection('mensagem')
      .onSnapshot({ includeMetadataChanges: false }, function (snapshot) {
        snapshot.docChanges().forEach(function (change) {
          if (change.type === "added") {
            const { mensagem, user, profilePic, imagem } = change.doc.data()
            const id = change.doc.id
            mensagens_enviadas.push({ mensagem, user, profilePic, imagem, id })
          }
        })
        setMensagens([...mensagens_enviadas])
        scrollview ? scrollview.scrollToEnd({ animated: true }) : null;
      })
    return () => {
      unsubscribe()
    }
  }, [])

  const carregaUsuarioAnonimo = () => {
    axios.get('https://randomuser.me/api/')
      .then(function (response) {
        const user = response.data.results[0];
        // setDistance(response.data.distance)
        setUser({
          name: `${user.name.first} ${user.name.last}`,
          picture: user.picture.large  
        })

      })
      .catch(function (error) {
        console.log(error);
      });
  }
 
  return (
    <KeyboardAvoidingView style={styles.container}>
      
        {/* Header */}
        {user &&
          <View style={styles.header}>
            <TouchableOpacity onPress={()=>props.navigation.navigate("Room")}>
              <Image style={{ width: 30, height: 30 }} source={btnArrowLeft} />
            </TouchableOpacity>
            <Text style={styles.titlePage}>Ponto 1</Text>
            <TouchableOpacity onPress={carregaUsuarioAnonimo}>
              <Image 
                style={{ width: 35, height: 35 }}
                source={{ uri: user.picture }} />
            </TouchableOpacity>
          </View>
        }

        {/* Body  */}
      
      <View style={styles.containerChat}>
        <ScrollView style={styles.scrollview} ref={(view) => { setScrollview(view) }}>
          {
            mensagens.length > 0 && mensagens.map(item => (
              <View key={item.id} style={styles.linha_conversa}>
                <Image style={styles.avatar_conversa} source={{ uri: item.profilePic }} />
                <View style={{ flexDirection: 'column', marginTop: 5 }}>
                  <Text style={{ fontSize: 14, color: '#999' }}>{item.user}</Text>
                  {typeof (item.mensagem) == "string" ?
                    <Text style={{ fontSize: 12, color : '#999'}} >{item.mensagem}</Text>
                    :
                    <Text> </Text>
                  }
                    { item.imagem ? <Image source={{uri:item.imagem}}
                        style={styles.ImageView}/> : null}
                </View>

              </View>
            ))
          }
        </ScrollView>
      </View>
          {/* Footer > ./footer  Arquivo */}
      <Footer
      save={salvar}
      sendImage={setSavePicture}
      onChangeText={setCaixaTexto}
      onDestroy={closeModal}
      />
    </KeyboardAvoidingView>
  )

}
