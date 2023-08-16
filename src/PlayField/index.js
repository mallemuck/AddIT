import React, { useState, useRef, useEffect }  from 'react'
import { Alert, Image, Animated, StyleSheet, Text, View, ImageBackground, Dimensions, TouchableHighlight, Button, BackHandler} from 'react-native'
import RNFS from 'react-native-fs';             // for filehandling
import {styles} from "./style"

const filePath = RNFS.DocumentDirectoryPath + "/records.dat";   // where local records will be stored

const Sound = require('react-native-sound')   // for sounds

const images = [
  require('../../images/back.png'),           // main screen background image
  require('../../images/help1.png'),          // helpscreen #1
  require('../../images/help2.png')           // helpscreen #2
];

const PlayField = (props) => {                                // main game field
  const fadeAnim = useRef(new Animated.Value(0)).current;     // current number color animation
  const fadeNum = useRef(new Animated.Value(0)).current;      // bonus score (e.g. "+5") animation
  
// ------------------------------------------------------------- hooks section

  const [menuVisible, setMenuVisible] = useState (1);         // Menu visibility
  const [btnTitle, setBtnTitle] = useState ('Start game');    // Button title ('start game'/'resume')
  const [btnSound, setBtnSound] = useState ('Sounds:on');     // Sound status 
  const [helpVisible, setHelpVisible] = useState (0);         // Helpscreen visibility
  const [fadeValue, setFadeValue] = useState (1);             // Current number timer value
  const [imgLoading, setImgLoading] = useState (1);           // Image loading status
  const [step, setStep] = useState(0);                        // Current step (move) - user must finish every level in limited steps (moves)
  const [field, setField] = useState({                        // Main data structure
      playBox:resetted.arr,                                   // numbers field
      queue:resetted.add,                                     // numbers queue
      level:1,                                                // current game level
      score:0,                                                // current score
      x:props.x,                                              // coordinates of last pressed number
      y:props.y,                                              //     on field
      lives:5                                                 // lives left
    });
  const [nums, setNums] = useState ({                         // bonus field
    playNums:[
      ['','','','',''],
      ['','','','',''],
      ['','','','',''],
      ['','','','',''],
      ['','','','','']
    ]
  })
  const [records, setRecords] = useState ({                   // local records
    recs:[
      {record:0,date: ''},
      {record:0,date: ''},
      {record:0,date: ''},
      {record:0,date: ''},
      {record:0,date: ''}
    ]
  })
  
// ---------------------------------------------------------  end hooks section
// ---------------------------------------------------------  file handling

const readFile = async () => {                                    // reading scoresfrom file
  var response = ''; 
  try {
    response = await RNFS.readFile(filePath);
    recs=records;
    recs.recs = JSON.parse(response);
    setRecords(recs);                                             // set the value of response to the fileData Hook.
  } catch (error) {
    makeFile(writeRecords(records.recs));                         // if we still not have a file, make it
  }
};

const makeFile = async (content) => {
  try {                                                           // create a file at filePath. Write the content data to it
    await RNFS.writeFile(filePath, content, "utf8");
    console.log("written to file");
  } catch (error) {                                               // if the function throws an error, log it out.
    console.log(filePath+' error:'+error);
  }
};

function writeRecords(rr) {
  var recordlist = rr
  .sort((a,b) => b.record-a.record)
  .map((item) => '{"record":"'+item.record+'","date":"'+item.date+'"}');
  return '['+recordlist+']';
}

// ---------------------------------------------------------  end file handling

  const resetfield = () => {                                  // resetting all data 
    const myarray=[                                           // play field initializing
      [0,0,0,0,0],
      [0,0,0,0,0],
      [0,0,0,0,0],
      [0,0,0,0,0],
      [0,0,0,0,0]
    ];
    const myadd=[0,0,0,0,0,0];                                // numbers queue initializing
    for(let i = 0; i < 5; i++){
      for(let j = 0; j < 5; j++){
        myarray [i][j] = Math.floor(Math.random() * 9) + 1;   // fill all field with random numbers 
      }
    }
    for (let i = 0; i < 6; i++) {
      myadd[i]= Math.floor(Math.random() * 9) + 1;            // fill queue with random numbers
    }
    return ({arr:myarray, add:myadd});
  }
  const resetted = resetfield();

  const click = () => {                                       // click sound when pressing any button
    if (btnSound == 'Sounds:on') {
      setTimeout(() => {
        soundClick.play((success) => {});
      }, 100);
    }
  }

  const fadeMove = (op) => {                                  // bonus scores animation
    Animated.timing(fadeNum, {
      toValue: op,                                            // animation have 2 phases: 
      duration: op==0 ? 500 : 1000,                           //   slow moving up (op=1), then fast down (0)
      useNativeDriver: false
    }).start((o) => {
      if(o.finished) {                                        
        if (op==1) {                                          // when finished phase 1
        fadeMove(0)                                           // switch to second phase (op=0)
        } else {
          setNums({playNums:[                                 // when finished phase 2 reset all bonuses
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

  const fadeIn = (what,op,time,field) => {                    //  current number timer with animation
    Animated.timing(what, {
      toValue: op,
      duration: time,
      useNativeDriver: false
    }).start((o) => {
      if(o.finished) {
        if (op == 0) {                                        // than means player didn't press field in time
          let ii = [...field.playBox];                        // making copies of main data
          let iq = [...field.queue];
          let ip = Math.floor(Math.random() * 9) + 1;         // new number in queue
          iq.shift();                                         // current number is gone
          if (field.lives>0) {                                // player have one more live?
            field.lives-=1;                                   // lost 1 live
            if (btnSound == 'Sounds:on') {
              setTimeout(() => {
                soundError.play((success) => {});             // play nasty sound
              }, 100);
            }
            setField({                                        // setting new data
              playBox:ii, 
              queue:[...iq,ip],                               // add new number to queue
              x:field.x, 
              y:field.y,
              score:field.score,
              level:field.level,
              lives:field.lives
            });
            fadeIn(what,1,1,{                                 // start new color animation
              playBox:ii, 
              queue:[...iq,ip], 
              x:field.x, 
              y:field.y,
              score:field.score,
              level:field.level,
              lives:field.lives
            });
          } else {                                            // no lives left
              fadeAnim.stopAnimation(( value ) => {
                setFadeValue(value);                          // freezing animation 
              });
              var cons='';
              if (records.recs[4].record<field.score) {       // if player get a new highscore
                cons=' Congratulations! New highscore!';
                var rd = records;
                rd.recs[4].record=field.score;                // adding new score to list
                var date = new Date().getDate();                  //Current Date
                var month = new Date().getMonth() + 1;            //Current Month
                var year = new Date().getFullYear();              //Current Year
                rd.recs[4].date=date+'/'+month+'/'+year;
                rd.recs=rd.recs.sort((a,b) => b.record-a.record); // then sorting it
                setRecords(rd);
                makeFile(writeRecords(records.recs));         // and writing to file
              }
              Alert.alert(                                    // showing gameover dialog
              'Game over ',
              'Your score:'+field.score+cons,
              [
                {text: 'OK', onPress: this.onDeleteBTN},
              ],
              { cancelable: false }
            );
            setTimeout(() => {setStep(0);}, 100);             // resetting 
            const resetted = resetfield();                    //    all
            setField({                                        //   data
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
          fadeIn(what,0,calcTime(field.level,step),field);    // player pressed field on time, so just start new animation
        }
      }
    });
  };

  const backHandler = BackHandler.addEventListener('hardwareBackPress', function () { // listing helpscreens
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

  fieldAdd = (fld,x,y,num,manual,scoreadd) =>             // adding current number to pressed number on field
  {
    var score = 0;                                        // how much score player will earn by pressin field
    if (manual || fld[x][y]>1 || (num>0 & fld[x][y]>0) || (fld[x][y]+num)<0) { fld[x][y]+=num;} // adding current number to field
    if (fld[x][y]<0) {                                    // when sum of current number and number in box > 10 
      fld[x][y]+= 10                                      // all adjacent numbers reduces by 1 if there are 0 in that field, it becomes 9
      score = -scoreadd;                                  // and player loss in score for every case
    }
    if (fld[x][y]>9) {                                     
      fld[x][y]-=10;                                      // when sum in box > 10 all adjacent boxes
      var iq = fld[x][y] ==0 ? 1 : -1;                    // get +1 if sum =10 or -1 if sum >10
      if (fld[x][y] ==0) {score+=scoreadd;                // if sum = 10 player is the BOSS, he got score
        let nn = [...nums.playNums];                      //
        nn[x][y] = '+'+scoreadd;                          // and bonus 
        setNums({playNums:nn});                           // (+1 for every adjacent boxes which become 10) 
        fadeMove(1);                                      // start bonus animation
        if (btnSound == 'Sounds:on') {
          setTimeout(() => {
            soundBubble.play((success) => {               // bubble sound
            });
          }, 100*scoreadd);
        }
      }
      else {score-=scoreadd}                              // if sum>10 player loses
      for (let k = Math.max(0,x-1); k <= Math.min(4,x+1); k++) {      // setting +1 or -1 to adjacent boxes 
        if (y>0) {score+=fieldAdd (fld,k,y-1,iq,false,scoreadd+1);}   // line of boxes above pressed   
        if (y<4) {score+=fieldAdd (fld,k,y+1,iq,false,scoreadd+1);}   // line of boxes under pressed          
      }                                                               //
      if (x>0) {score+=fieldAdd(fld,x-1,y,iq,false,scoreadd+1)}       //  box left from pressed
      if (x<4) {score+=fieldAdd(fld,x+1,y,iq,false,scoreadd+1)}       //  box right from pressed
    }
    return (score)      // function returs earned score so every iteration enlarged overall score 
  }
    
  function arrSum(arr,x,y) {        // just sum of all numbers on field. when it=0, player wins the level 
    var sum = 0;
    for (let i=0; i<x; i++) {
      for (let j=0; j<y; j++) {
        sum+=arr[i][j]
      }
    }
    return sum;
  }

  function calcTime(l,s) {                                          // timer for current number
    const steps = [10,10,15,20,25,30]                               // every level have count of moves
    var ss = l>5 ? 5 : l;                                           // when it exausted, we reduce timer 
    var tt = l>5 ? 1+10000/(l-5) : 10000;                           // at higher levels timer becomes shorter
    if (s>steps[ss]) {tt = tt/((s-steps[ss])/3)}                    // because it is not a fairy tale
    return tt
  }

  onOkBTN = () => {                                                // Dialog closed
    fadeAnim.setValue(1);                                          // so we can start timer again
    fadeIn(fadeAnim,0,10000,field);
  }

  onPressBTN = () => {                                            // all magic begins when player pressed on field
      fadeAnim.setValue(1);                                       // player do it in time, so reset the animation
      setStep(step+1);                                            // step (move) counter +1
      click();                                                    // do click sound
      let ii = [...field.playBox];                                // making copy of playbox
      let ic = fieldAdd(ii,i,j,field.queue[0],true,1);            // adding num from queue to playfield
      if (ic<0) {field.lives-=1; ic=0                             // negative response means player lost one live
        if (btnSound == 'Sounds:on') {                            // so play nasty sound
            setTimeout(() => {
              soundError.play((success) => {
              });
            }, 100);
        }
      }
      if (field.lives<0) {                                      // if no more lives left
        fadeAnim.stopAnimation(( value ) => {                   // freezing animation 
          setFadeValue(value);
        });
        var cons='';
        if (records.recs[4].record<field.score) {               // if player get a new highscore
          cons=' Congratulations! New highscore!';
          var rd = records;
          rd.recs[4].record=field.score;                        // adding new score to list
          var date = new Date().getDate();                      //Current Date
          var month = new Date().getMonth() + 1;                //Current Month
          var year = new Date().getFullYear();                  //Current Year
          rd.recs[4].date=date+'/'+month+'/'+year;
          rd.recs=rd.recs.sort((a,b) => b.record-a.record);
          setRecords(rd);
          makeFile(writeRecords(records.recs));
        }
        Alert.alert(                                            // show gameover dialog
          'Game over',
          'Your score:'+field.score+cons,
          [
            {text: 'OK', onPress: this.onOkBTN},
          ],
          { cancelable: false }
        );
        setTimeout(() => {setStep(0);}, 100);                   // resetting
        const resetted = resetfield();                          //     all
        setField({                                              //    data
                playBox:resetted.arr, 
                queue:resetted.add, 
                x:3, 
                y:3,
                score:0,
                level:1,
                lives:5
              });
      } else {                                                  // if player still in game
      field.score+=ic;                                          // update score by result of adding (maybe negative)
      let iq = [...field.queue];
      iq.shift();                                               
      setField({                                                // updating playfield
        playBox:ii,                                             // by new data from addField()
        queue:[...iq,Math.floor(Math.random() * 9) + 1],        // and new number from queue
        x:field.x, 
        y:field.y,
        score:field.score,
        level:field.level,
        lives:field.lives
      });
      if (arrSum(ii,field.x,field.y)==0) {                      // maybe we already won the level?
        fadeAnim.stopAnimation(( value ) => {                   // so top animation
          setFadeValue(value);
        });
       Alert.alert(                                             // show congrats screen
          'Level completed',
          'Press OK for next level',
          [
            {text: 'OK', onPress: this.onOkBTN},
          ],
          { cancelable: false }
        );
        setTimeout(() => {setStep(0);}, 100);
        var xx = field.x;
        var yy = field.y;
        if (xx<yy) {xx++}
        else {
          if (yy<5) {yy++}
        }
        const resetted = resetfield();                          // and reset all data
        setNums({playNums:[
          ['','','','',''],
          ['','','','',''],
          ['','','','',''],
          ['','','','',''],
          ['','','','','']
        ]});        
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
  }

// ---------------------------------------------------------  begin filling code
    var boxRows = field.x;                                        //  size of
    var boxCols = field.y;                                        //  playfield
  
    var myBox = [];                                               //  playfield code blank
    var myNums = [];                                              //  bonus scores code blank

    var xs = [];                                                  // x and y coordinates for
    var ys = [];                                                  // animated bonus scores

    var xw = (Dimensions.get("window").width-20)/5;               // getting playfield box width
    var xy = (Dimensions.get("window").width-xw*boxCols)/2;       // and calculating actual
    var xx = (Dimensions.get("window").width-xw*boxRows)/2;       // playfiels dimensions

    for (let i=0;i<boxRows;i++) {
      for (let j=0;j<boxCols;j++) {
      xs[i,j] = fadeNum.interpolate({                             // every bonus score moves to random  
        inputRange: [0, 1],                                       // position nearby pressed box
        outputRange: [xx+xw*i, xw*i+xx-10+Math.floor(Math.random() * 20)]
      });
      ys[i,j] = fadeNum.interpolate({
        inputRange: [0, 1],
        outputRange: [xy+xw*j, xw*j+xy-10+Math.floor(Math.random() * 20)]
      });
      myNums.push(                                                // adding code to blank
        <Animated.View key={'m'+i+'.'+j} style= {[{position:'absolute', top:xs[i,j], left:ys[i,j], opacity:fadeNum}]} pointerEvents={'none'}>
          <Text key={'t'+i+'.'+j} style = {[{fontSize:62, fontFamily:'PollockC3', color:'green'}]}>
            {nums.playNums[i][j]}
          </Text>
        </Animated.View>
      );
      }
    }
  
    const boxSizes = {                                            // calculating field box sizes  
      height : Math.floor(Dimensions.get("window").width*boxRows/5)-(5+5*(boxRows-2)),
      width : Math.floor(Dimensions.get("window").width*boxCols/5)-(5+5*(boxCols-2))
    }
    for(let i = 0; i < boxRows; i++){
      var myRow = [];
      for(let j = 0; j < boxCols; j++){                          // look at the playfield structure
          myRow.push (                                           // in styles.js
            <View key = {'viewFrame'+(i+1)+(j+1)} style= {styles.box5}>  
              <View key = {'viewBox'+(i+1)+(j+1)} style= {styles.box}>
                <TouchableHighlight key = {'viewContent'+(i+1)+(j+1)} onPress = {this.onPressBTN} style= {styles.content}>
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
    var qcolors = ['#394','#283','#172','#061','#050'];     // queue box colors
    var color = fadeAnim.interpolate({                      // current number comes light green
      inputRange: [0, 1],                                   // and becomes more and more red
      outputRange: ['#F00', '#394']                         // according to timer
    });
    myQueue.push(                                           // first element of queue - animated current number
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
      fadeAnim.setValue(fadeValue);                         //  starting current number animation
      readFile();                                           //  reading highscores
    }, []);
    
    setTimeout(() => {                                      // loading sounds
      const soundBubble = new Sound("bubble.mp3",Sound.MAIN_BUNDLE, (error) => {});
      const soundClick = new Sound("click.mp3",Sound.MAIN_BUNDLE, (error) => {});
      const soundError = new Sound("error.mp3",Sound.MAIN_BUNDLE, (error) => {});
    }, 100);
    
    if (menuVisible==0) fadeIn(fadeAnim,0,calcTime(field.level,step),field); // if game paused freeze the timer

    for (let i = 1; i < 5; i++){
      myQueue.push(                                        // left elements of queue
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
    if (menuVisible>0) {                                  // main menu showed when game paused or not started
      if (helpVisible>0) {                                // helpscreen
        helpVisible == 1 ? myMenu.push(                   // helpscreen1 have buttons
          <ImageBackground key='img1' source={images[1]} resizeMode="cover" style= {{position:'absolute', top:0, left:0, width:'100%', height: '100%'}}>
          <View key='v1' style = {{width:'100%', height:'100%', padding:10, flexDirection:'column-reverse'}}>
          <Button key='b1' title='Next' onPress={() => {
              click();
              setHelpVisible(2);
            }}/>
          </View>    
          </ImageBackground>
        ) : myMenu.push(                                  // helpscreen2 not
          <ImageBackground key='img2'  source={images[2]} resizeMode="cover" style= {{position:'absolute', top:0, left:0, width:'100%', height: '100%'}}>
    
          </ImageBackground>
        )
      } else {
      myMenu.push(                                        // main menu when game paused or not started yet
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
              click();                                        // title of this button is the state of sounds
              if (btnSound == 'Sounds:on') {
                setBtnSound('Sounds:off')
              } else {
                setBtnSound('Sounds:on')
              }
            }}/>
            <View style={{minHeight:10}}>

            </View>
            <View key="rr" style={[styles.boxrows, {alignItems:'baseline',position:'absolute', padding:30, top:5, backgroundColor:'rgba(127,255,127,0.5)', borderRadius: 10}]}>
            <Text style={{fontSize:28, left:40}}>Local Records{"\n"}</Text>
            <Text style={{fontSize:28}}>{records.recs[0].date} : {records.recs[0].record}</Text>
            <Text style={{fontSize:28}}>{records.recs[1].date} : {records.recs[1].record}</Text>
            <Text style={{fontSize:28}}>{records.recs[2].date} : {records.recs[2].record}</Text>
            <Text style={{fontSize:28}}>{records.recs[3].date} : {records.recs[3].record}</Text>
            <Text style={{fontSize:28}}>{records.recs[4].date} : {records.recs[4].record}</Text>
            </View>
            </View>
        </ImageBackground>
      )
    }} else {
      myMenu = [];
    }
    
    if (imgLoading) {
      setTimeout(() => {                                      // waiting for images for 3 sec
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
    const steps = [10,10,15,20,25,30]
    return (                                                // composing playfield
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
            L:{field.level} ♥:{field.lives} {field.level>5 ? steps[5]-step<0 ? '☻':'☺' : steps[field.level]-step<0 ? '☻':'☺'}:{field.level>5 ? steps[5]-step<0 ? 0:steps[5]-step : steps[field.level]-step<0 ? 0 :steps[field.level]-step} S:{field.score}
          </Text>
          <View key='v10' style={{height: 1, backgroundColor: 'black', margin: 5}}>
          </View>
          <Button key='b6' title='Restart' onPress={() => {
            click();
            fadeAnim.setValue(1);
            setStep(0);
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