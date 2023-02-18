import React, { useState, useRef, useEffect }  from 'react'
import { Alert, Image, Animated, StyleSheet, Text, View, ImageBackground, Dimensions, TouchableHighlight, Button, BackHandler} from 'react-native'
const Sound = require('react-native-sound')
const images = [
  require('../../images/back.png'),
  require('../../images/help1.png'),
  require('../../images/help2.png')
];

const styles = StyleSheet.create({
  number : {
    fontSize : 32
  },
  content : {
    margin: 3,
    flex: 1,
    backgroundColor: '#BAD',
    borderRadius : 5,
    justifyContent : 'center',
    alignItems : 'center'
  },
  box : {
    borderColor : '#AAA',
    borderStyle : 'solid',
    borderWidth :2,
    flex : 1,
    margin : -2,
    borderRadius : 6
  },
  box5 : {
    width: (Dimensions.get("window").width-20)/5,
    height: (Dimensions.get("window").width-20)/5,
    overflow : 'hidden'
  },
  boxrows : {
    width : Dimensions.get("window").width-20,
    height : Dimensions.get("window").width-20,
    margin: 10,
    justifyContent : 'center',
    alignItems : 'center'
  },
  box5rows : {
    borderRadius : 10,
    backgroundColor: 'rgba(255,255,255,0.5)',
    overflow : 'hidden'
  },
  box5cols : {
    width : "100%",
    height: (Dimensions.get("window").width-20)/5,
    flexDirection : 'row',
    overflow : 'hidden'
  },
  statusBox : {
    width : Dimensions.get("window").width-20,
    margin: 10,
    marginTop: 0,
    flex: 1,
    borderRadius : 10,
    backgroundColor: 'rgba(255,255,255,0.5)'
  }
})

const PlayField = (props) => {

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fadeNum = useRef(new Animated.Value(0)).current;

  const resetfield = () => {
    const myarray=[
      [0,0,0,0,0],
      [0,0,0,0,0],
      [0,0,0,0,0],
      [0,0,0,0,0],
      [0,0,0,0,0]
    ];
    const myadd=[0,0,0,0,0,0];  
    for(let i = 0; i < 5; i++){
      for(let j = 0; j < 5; j++){
        myarray [i][j] = Math.floor(Math.random() * 9) + 1;
      }
    }
    for (let i = 0; i < 6; i++) {
      myadd[i]= Math.floor(Math.random() * 9) + 1;
    }
    return ({arr:myarray, add:myadd});
  }

  const click = () => {
    if (btnSound == 'Sounds:on') {
      setTimeout(() => {
        var sound = new Sound("click.mp3",Sound.MAIN_BUNDLE, (error) => {
                      /* ... */
        });
 
        setTimeout(() => {
          sound.play((success) => {
            sound.release();
          });
        }, 100);
      }, 100);
    }
  }

  const fadeMove = (op) => {
    Animated.timing(fadeNum, {
      toValue: op,
      duration: op==0 ? 500 : 1000,
      useNativeDriver: false
    }).start((o) => {
      if(o.finished) { 
        if (op==1) {
        fadeMove(0)
        } else {
          setNums({playNums:[
            ['','','','',''],
            ['','','','',''],
            ['','','','',''],
            ['','','','',''],
            ['','','','','']
          ]})
        } 
      } 
    });
  }

  const fadeIn = (what,op,time,field) => {
    Animated.timing(what, {
      toValue: op,
      duration: time,
      useNativeDriver: false
    }).start((o) => {
      if(o.finished) {
        if (op == 0) { 
          let ii = [...field.playBox];
          let iq = [...field.queue];
          let ip = Math.floor(Math.random() * 9) + 1;
          iq.shift();
          if (field.lives>0) {
            field.lives-=1;
            if (btnSound == 'Sounds:on') {
              setTimeout(() => {
                var sound = new Sound("error.mp3",Sound.MAIN_BUNDLE, (error) => {
                              /* ... */
                });
         
                setTimeout(() => {
                  sound.play((success) => {
                    sound.release();
                  });
                }, 100);
              }, 100);
            }
            setField({
              playBox:ii, 
              queue:[...iq,ip], 
              x:field.x, 
              y:field.y,
              score:field.score,
              level:field.level,
              lives:field.lives
            });
            fadeIn(what,1,1,{
              playBox:ii, 
              queue:[...iq,ip], 
              x:field.x, 
              y:field.y,
              score:field.score,
              level:field.level,
              lives:field.lives
            });
          } else {
            Alert.alert(
              'Game over',
              'Your score:'+field.score,
              [
                {text: 'OK', onPress: this.onDeleteBTN},
              ],
              { cancelable: false }
            );

            const resetted = resetfield();
            setField({
                    playBox:resetted.arr, 
                    queue:resetted.add, 
                    x:3, 
                    y:3,
                    score:0,
                    level:1,
                    lives:5
            });  
            fadeIn(what,1,1,{
              playBox:resetted.arr, 
              queue:resetted.add, 
              x:3, 
              y:3,
              score:0,
              level:1,
              lives:5
            });
          }
        }
        else {
          fadeIn(what,0,field.level>5 ? tt=1+10000/(field.level-5) : 10000,field);
        }
      }
    });
  };

  const backHandler = BackHandler.addEventListener('hardwareBackPress', function () {
    if (helpVisible>0) {
      setHelpVisible(0);
    }
    else {  
    if (menuVisible==0) {
      setMenuVisible(1);
      fadeAnim.stopAnimation(( value ) => {
        setFadeValue(value);
      });
    } else {
      setMenuVisible(0);
      fadeAnim.setValue(fadeValue);
    }
    }
    return true;
  });

  const resetted = resetfield();

  const [menuVisible, setMenuVisible] = useState (1);

  const [btnTitle, setBtnTitle] = useState ('Start game');

  const [btnSound, setBtnSound] = useState ('Sounds:on');

  const [helpVisible, setHelpVisible] = useState (0);

  const [fadeValue, setFadeValue] = useState (1);

  const [imgLoading, setImgLoading] = useState (1);

  const [field, setField] = useState({ 
      playBox:resetted.arr,
      queue:resetted.add,
      level:1,
      score:0,
      x:props.x,
      y:props.y,
      lives:5
    });

  const [nums, setNums] = useState ({
    playNums:[
      ['','','','',''],
      ['','','','',''],
      ['','','','',''],
      ['','','','',''],
      ['','','','','']
    ]
  })

    fieldAdd = (fld,x,y,num,manual,scoreadd) => 
    {
      var score = 0;
      if (manual || fld[x][y]>1 || (num>0 & fld[x][y]>0) || (fld[x][y]+num)<0) { fld[x][y]+=num;}
      if (fld[x][y]<0) {
        fld[x][y]+= 10
        score = -scoreadd;
      }
      if (fld[x][y]>9) {
        fld[x][y]-=10;
        var iq = fld[x][y] ==0 ? 1 : -1;
        if (fld[x][y] ==0) {score+=scoreadd; 
          let nn = [...nums.playNums];
          nn[x][y] = '+'+scoreadd;
          setNums({playNums:nn});
          fadeMove(1);
          if (btnSound == 'Sounds:on') {
            setTimeout(() => {
              var sound = new Sound("bubble.mp3",Sound.MAIN_BUNDLE, (error) => {
                            /* ... */
              });
       
              setTimeout(() => {
                sound.play((success) => {
                  sound.release();
                });
              }, 100*scoreadd);
            }, 100);
          }
        }
        else {score-=scoreadd}
        for (let k = Math.max(0,x-1); k <= Math.min(4,x+1); k++) {
          if (y>0) {score+=fieldAdd (fld,k,y-1,iq,false,scoreadd+1);}
          if (y<4) {score+=fieldAdd (fld,k,y+1,iq,false,scoreadd+1);}
        }
        if (x>0) {score+=fieldAdd(fld,x-1,y,iq,false,scoreadd+1)}
        if (x<4) {score+=fieldAdd(fld,x+1,y,iq,false,scoreadd+1)}
      }
      return (score)
    }
    
  function arrSum(arr,x,y) {
    var sum = 0;
    for (let i=0; i<x; i++) {
      for (let j=0; j<y; j++) {
        sum+=arr[i][j]
      }
    }
    return sum;
  }

  onDeleteBTN = () => {
    fadeAnim.setValue(1);
    fadeIn(fadeAnim,0,field.level>5 ? tt=1+10000/(field.level-5) : 10000,field);
  }

  var boxRows = field.x;
    var boxCols = field.y;
  
    var myBox = [];
    var myNums = [];

    var xs = [];
    var ys = [];

    var xw = (Dimensions.get("window").width-20)/5;
    var xy = (Dimensions.get("window").width-xw*boxCols)/2;
    var xx = (Dimensions.get("window").width-xw*boxRows)/2;

    for (let i=0;i<boxRows;i++) {
      for (let j=0;j<boxCols;j++) {
      xs[i,j] = fadeNum.interpolate({
        inputRange: [0, 1],
        outputRange: [xx+xw*i, xw*i+xx-10+Math.floor(Math.random() * 20)]
      });
      ys[i,j] = fadeNum.interpolate({
        inputRange: [0, 1],
        outputRange: [xy+xw*j, xw*j+xy-10+Math.floor(Math.random() * 20)]
      });
      myNums.push(
        <Animated.View key={'m'+i+'.'+j} style= {[{position:'absolute', top:xs[i,j], left:ys[i,j], opacity:fadeNum}]} pointerEvents={'none'}>
          <Text key={'t'+i+'.'+j} style = {[{fontSize:62, fontFamily:'PollockC3', color:'green'}]}>
            {nums.playNums[i][j]}
          </Text>
        </Animated.View>
      );
      }
    }
  
    const boxSizes = {
      height : Math.floor(Dimensions.get("window").width*boxRows/5)-(5+5*(boxRows-2)),
      width : Math.floor(Dimensions.get("window").width*boxCols/5)-(5+5*(boxCols-2))
    }
    for(let i = 0; i < boxRows; i++){
      var myRow = [];
      for(let j = 0; j < boxCols; j++){
          myRow.push (
            <View key = {'viewFrame'+(i+1)+(j+1)} style= {styles.box5}>
              <View key = {'viewBox'+(i+1)+(j+1)} style= {styles.box}>
                <TouchableHighlight key = {'viewContent'+(i+1)+(j+1)} onPress={() => {
                  fadeAnim.setValue(1);
                  click();
                  let ii = [...field.playBox];
                  let ic = fieldAdd(ii,i,j,field.queue[0],true,1);
                  if (ic<0) {field.lives-=1; ic=0
                    if (btnSound == 'Sounds:on') {
                      setTimeout(() => {
                        var sound = new Sound("error.mp3",Sound.MAIN_BUNDLE, (error) => {
                                      /* ... */
                        });
                 
                        setTimeout(() => {
                          sound.play((success) => {
                            sound.release();
                          });
                        }, 100);
                      }, 100);
                    }
                  }
                  if (field.lives<0) {
                    Alert.alert(
                      'Game over',
                      'Your score:'+field.score,
                      [
                        {text: 'OK', onPress: this.onDeleteBTN},
                      ],
                      { cancelable: false }
                    );
                    const resetted = resetfield();
                    setField({
                            playBox:resetted.arr, 
                            queue:resetted.add, 
                            x:3, 
                            y:3,
                            score:0,
                            level:1,
                            lives:5
                          });
                  } else {
                  field.score+=ic;
                  let iq = [...field.queue];
                  iq.shift();
                  setField({
                    playBox:ii, 
                    queue:[...iq,Math.floor(Math.random() * 9) + 1], 
                    x:field.x, 
                    y:field.y,
                    score:field.score,
                    level:field.level,
                    lives:field.lives
                  });
                  if (arrSum(ii,field.x,field.y)==0) {
                    setNums({playNums:[
                      ['','','','',''],
                      ['','','','',''],
                      ['','','','',''],
                      ['','','','',''],
                      ['','','','','']
                    ]})
                   Alert.alert(
                      'Level completed',
                      'Press OK for next level',
                      [
                        {text: 'OK', onPress: this.onDeleteBTN},
                      ],
                      { cancelable: false }
                    );
                    var xx = field.x;
                    var yy = field.y;
                    if (xx<yy) {xx++}
                    else {
                      if (yy<5) {yy++}
                    }
                    const resetted = resetfield();
                    setField({
                            playBox:resetted.arr, 
                            queue:resetted.add, 
                            x:xx, 
                            y:yy,
                            score:field.score,
                            level:field.level+1,
                            lives:field.lives
                          });    
                    }
                  }
                  }} style= {styles.content}>
                  <Text key = {'ptext'+(i+1)+(j+1)} style= {styles.number} >
                    {field.playBox[i][j] == 0 ? '':field.playBox[i][j]}
                  </Text>
                </TouchableHighlight>
              </View>
            </View>
          )
      }
      myBox.push(
        <View key={'rowview'+i} style= {styles.box5cols}>
          {myRow}
        </View>
      )
    }
    var myQueue = [];
    var qcolors = ['#394','#283','#172','#061','#050'];
    var color = fadeAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['#F00', '#394']
    });
    myQueue.push(
        <View key='q1' style= {styles.box5}>
          <View key='q2' style= {styles.box}>
            <Animated.View key='q3' style= {[styles.content, {backgroundColor: color}]}>
              <Text key='qt1' style= {styles.number} >
                {field.queue[0]}
              </Text>
            </Animated.View>
          </View>
        </View>
      )
    useEffect(() => {
      fadeAnim.setValue(fadeValue);
    }, []);
    
    if (menuVisible==0) fadeIn(fadeAnim,0,field.level>5 ? tt=1+10000/(field.level-5) : 10000,field);
    for (let i = 1; i < 5; i++){
      myQueue.push(
        <View key={'qq1'+i} style= {styles.box5}>
          <View key={'qq2'+i} style= {styles.box}>
            <View key={'qq3'+i} style= {[styles.content, {backgroundColor: qcolors[i]}]}>
              <Text key={'qt2'+i} style= {styles.number} >
                {field.queue[i]}
              </Text>
            </View>
          </View>
        </View>
      )
    };
    var myMenu = [];
    if (menuVisible>0) {
      if (helpVisible>0) {
        helpVisible == 1 ? myMenu.push(
          <ImageBackground key='img1' source={images[1]} resizeMode="cover" style= {{position:'absolute', top:0, left:0, width:'100%', height: '100%'}}>
          <View key='v1' style = {{width:'100%', height:'100%', padding:10, flexDirection:'column-reverse'}}>
          <Button key='b1' title='Next' onPress={() => {
              click();
              setHelpVisible(2);
            }}/>
          </View>    
          </ImageBackground>
        ) : myMenu.push(
          <ImageBackground key='img2'  source={images[2]} resizeMode="cover" style= {{position:'absolute', top:0, left:0, width:'100%', height: '100%'}}>
    
          </ImageBackground>
        )
      } else {
      myMenu.push(
        <ImageBackground key='img3' source={images[0]} resizeMode="cover" style= {{position:'absolute', top:0, left:0, width:'100%', height: '100%'}}>
            <View key='v21' style = {{width:'100%', height:'100%', padding:10, flexDirection:'column-reverse'}}>
            <Button key='b2' title='Exit' onPress={() => {click();BackHandler.exitApp();}}/>
            <View key='h1' style={{height: 1, backgroundColor: 'black', margin: 5}}>
            </View>
            <Button key='b3' title='Help' onPress={() => {
              click();
              setHelpVisible(1);
            }}/>
            <View key='h2' style={{height: 1, backgroundColor: 'black', margin: 5}}>
            </View>
            <Button key='b4' title={btnTitle} onPress={() => {
              click();
              setBtnTitle('Resume');
              setMenuVisible(0);
              fadeAnim.setValue(fadeValue);
            }}/>
            <View key='h3' style={{height: 1, backgroundColor: 'black', margin: 5}}>
            </View>
            <View key='h4' style={{height: 1, backgroundColor: 'black', margin: 5}}>
            </View>
            <Button key='b5' title={btnSound} onPress={() => {
              click();
              if (btnSound == 'Sounds:on') {
                setBtnSound('Sounds:off')
              } else {
                setBtnSound('Sounds:on')
              }
            }}/>
            </View>
        </ImageBackground>
      )
    }} else {
      myMenu = [];
    }
    
    if (imgLoading) {
      setTimeout(() => {
       setImgLoading(0);
      },3000);
      return (
        <>
          <View key='r1' style= {{ flex: 1, flexDirection:"column", alignContent:"center", justifyContent: "center", alignItems:"center" }}>          
          <Text style={[{fontSize:22, width:'100%', alignSelf:'center', textAlign:'center'}]}>Loading...</Text>
          <Image source={images[0]} style={[{position:'absolute',left:500,top:500}]}></Image>
          <Image source={images[1]} style={[{position:'absolute',left:500,top:500}]}></Image>
          <Image source={images[2]} style={[{position:'absolute',left:500,top:500}]}></Image>
          </View>
        </> 
       )
    } else {
  
    return (
    <View key='r1' style= {{ flex: 1 }}>
      <ImageBackground key='r2' source={images[0]} resizeMode="cover" style= {{ flex:1 }}>
        <View key='r3' style= {styles.boxrows}>
          <View key='r4' style= {styles.box5rows}>
           {myBox}
          </View>
        </View>
        {myNums}
        <View key='r5' style = {styles.statusBox}>
          <View key='r6' style = {{width:'100%', flexDirection:'row'}}>
          {myQueue}
          </View>
          <View key='v92' style={{height: 1, backgroundColor: 'black', margin: 5}}>
          </View>
          <Text style = {{fontSize:28, padding:10}}>
            L : {field.level} ♥: {field.lives} S: {field.score} 
          </Text>
          <View key='v10' style={{height: 1, backgroundColor: 'black', margin: 5}}>
          </View>
          <Button key='b6' title='Restart' onPress={() => {
            click();
            fadeAnim.setValue(1);
            const resetted = resetfield();
                  setField({
                    playBox:resetted.arr, 
                    queue:resetted.add, 
                    x:3, 
                    y:3,
                    score:0,
                    level:1,
                    lives:5
                  });
          }} style = {{margin:10}}/>
          <View key='v11' style={{height: 1, backgroundColor: 'black', margin: 5}}>
          </View>
          <Button  key='b7' title='Pause' onPress={() => {
            click();
            setMenuVisible(1);
            fadeAnim.stopAnimation(( value ) => {
              setFadeValue(value);
            }
          );
          }}/>
        </View>
    </ImageBackground>
    {myMenu}
    </View>
  );
  }
}

export default PlayField 