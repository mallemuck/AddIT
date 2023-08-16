import {StyleSheet} from 'react-native';

/******************************************************************************** 

Playfield structure

I----------------------------boxrows---------------------------------------I
I   I------------------------------box5rows-----------------------------I  I
I   I   I--------------------- box5cols------------------------------I  I  I  
I   I   I   I---------------------------- box5 -------------------I  I  I  I
I   I   I   I   I---------- box -----------I I--I I--I I--I I--I  I  I  I  I
I   I   I   I   I   I ---- content ----I   I I  I I  I I  I I  I  I  I  I  I
I   I   I   I   I   I       number     I   I I  I I  I I  I I  I  I  I  I  I
I   I   I   I   I   I------------------I   I I  I I  I I  I I  I  I  I  I  I
I   I   I   I   I--------------------------I I--I I--I I--I I--I  I  I  I  I
I   I   I   I-----------------------------------------------------I  I  I  I
I   I   I------------------------------------------------------------I  I  I
I   I                                                                   I  I
I   I   I------------------------------------------------------------I  I  I
I   I   I                                                            I  I  I
I   I   I------------------------------------------------------------I  I  I
I   I                                                                   I  I
I   I   I------------------------------------------------------------I  I  I
I   I   I                                                            I  I  I
I   I   I------------------------------------------------------------I  I  I
I   I-------------------------------------------------------------------I  I   
I--------------------------------------------------------------------------I

**********************************************************************************/

const styles = StyleSheet.create({
    number : {                                                  // number in box
      fontSize : 32                                             // have to do it dynamic for big screens
    },
    content : {                                                 // number box content
      margin: 3,
      flex: 1,
      backgroundColor: '#BAD',
      borderRadius : 5,
      justifyContent : 'center',
      alignItems : 'center'
    },
    box : {                                                    // number box wrapper
      borderColor : '#AAA',
      borderStyle : 'solid',
      borderWidth :2,
      flex : 1,
      margin : -2,
      borderRadius : 6
    },
    box5 : {                                                  // row of boxes wrapper
      width: (Dimensions.get("window").width-20)/5,
      height: (Dimensions.get("window").width-20)/5,
      overflow : 'hidden'
    },
    boxrows : {                                               // wrapper for all field
      width : Dimensions.get("window").width-20,
      height : Dimensions.get("window").width-20,
      margin: 10,
      justifyContent : 'center',
      alignItems : 'center'
    },
    box5rows : {                                            // wrapper for all rows
      borderRadius : 10,
      backgroundColor: 'rgba(255,255,255,0.5)',
      overflow : 'hidden'
    },
    box5cols : {                                            // wrapper for every row
      width : "100%",
      height: (Dimensions.get("window").width-20)/5,
      flexDirection : 'row',
      overflow : 'hidden'
    },
    statusBox : {                                           // game status field
      width : Dimensions.get("window").width-20,
      margin: 10,
      marginTop: 0,
      flex: 1,
      borderRadius : 10,
      backgroundColor: 'rgba(255,255,255,0.5)'
    }
  })
  