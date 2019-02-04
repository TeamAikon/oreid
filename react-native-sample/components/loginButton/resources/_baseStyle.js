import { StyleSheet } from 'react-native';
export let baseStyle = StyleSheet.create({

  ButtonStyle: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderWidth: .5,
      borderColor: '#fff',
      height: 40,
      borderRadius: 5 ,
      margin: 5,
    },
    
    LogoStyle: {
      padding: 10,
      margin: 5,
      height: 25,
      width: 25,
      resizeMode : 'stretch'
    },
    
    TextStyle: {
      color: "#fff",
      marginBottom : 4,
      marginRight :20
    },
    
    SeparatorLineStyle: {
      backgroundColor : '#fff',
      width: 1,
      height: 40
    }

});

