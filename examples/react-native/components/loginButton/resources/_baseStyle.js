import { StyleSheet } from 'react-native';
export let baseStyle = StyleSheet.create({

  ButtonStyle: {
      paddingLeft: 10,
      paddingRight: 10,
      paddingTop: 5,
      paddingBottom: 5,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFF',
      borderWidth: .5,
      borderColor: '#fff',
      height: 40,
      borderRadius: 5 ,
      margin: 5,
      width: 200
    },
    
    LogoStyle: {
      marginRight: 14,
      height: 24,
      width: 24,
      resizeMode : 'stretch'
    },
    
    TextStyle: {
      color: "#FFFF",
      marginBottom : 4,
      marginLeft: 5,
      marginRight: 20,
      marginTop: 5
    },
    
    SeparatorLineStyle: {
      backgroundColor : '#fff',
      width: 1,
      height: 0
    }

});

