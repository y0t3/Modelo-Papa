import React,{useEffect,useMemo,useRef,useState} from 'react';
import {Animated,ScrollView,StyleSheet,View,useWindowDimensions} from 'react-native';
import {Gesture,GestureDetector} from 'react-native-gesture-handler';
import {clampZoom} from '../tabZoom';

type Props={
 zoom:number;onZoomChange:(next:number)=>void;
 scrollRef?:React.RefObject<ScrollView|null>;
 children:React.ReactNode;
};

export const clampPanX=(offset:number,scale:number,viewportWidth:number):number=>{
 const extent=Math.max(0,viewportWidth*clampZoom(scale)-viewportWidth);
 return Math.min(0,Math.max(-extent,offset));
};

/**
 * Zoom de pestañas: scroll vertical nativo y paneo horizontal con un dedo.
 *
 * Antes había dos ScrollView anidados en direcciones diferentes. En Android
 * el ScrollView interior capturaba el arrastre e impedía recorrer el eje X.
 * Ahora la navegación lateral usa un gesto Pan de eje X (sin scroll horizontal
 * anidado) y la lectura vertical conserva su ScrollView normal.
 */
export default function ZoomableTab({zoom,onZoomChange,scrollRef,children}:Props){
 const {width:windowWidth}=useWindowDimensions();
 const [viewportWidth,setViewportWidth]=useState(Math.round(windowWidth));
 const [contentHeight,setContentHeight]=useState(0);
 const [pinching,setPinching]=useState(false);
 const [panning,setPanning]=useState(false);
 const width=Math.max(1,viewportWidth);
 const currentZoom=clampZoom(zoom);
 const scale=useRef(new Animated.Value(currentZoom)).current;
 const translateX=useRef(new Animated.Value(0)).current;
 const lastZoom=useRef(currentZoom);
 const pinchBase=useRef(currentZoom);
 const nextZoom=useRef(currentZoom);
 const xOffset=useRef(0);
 const pinchStartX=useRef(0);
 const pinchFocalX=useRef(0);
 const panStartX=useRef(0);
 const notifyZoom=useRef(onZoomChange);

 useEffect(()=>{notifyZoom.current=onZoomChange},[onZoomChange]);
 useEffect(()=>{
  lastZoom.current=currentZoom;
  pinchBase.current=currentZoom;
  nextZoom.current=currentZoom;
  scale.setValue(currentZoom);
  xOffset.current=clampPanX(xOffset.current,currentZoom,width);
  translateX.setValue(xOffset.current);
 },[currentZoom,width,scale,translateX]);

 const pinch=useMemo(()=>Gesture.Pinch()
  .runOnJS(true)
  .onStart(event=>{
   pinchBase.current=lastZoom.current;
   nextZoom.current=lastZoom.current;
   pinchStartX.current=xOffset.current;
   pinchFocalX.current=Number.isFinite(event.focalX)?event.focalX:width/2;
   setPinching(true);
  })
  .onUpdate(event=>{
   const next=clampZoom(pinchBase.current*event.scale);
   const ratio=next/pinchBase.current;
   // El punto entre ambos dedos permanece en el mismo lugar de la pantalla.
   const x=pinchFocalX.current-(pinchFocalX.current-pinchStartX.current)*ratio;
   nextZoom.current=next;
   xOffset.current=clampPanX(x,next,width);
   scale.setValue(next);
   translateX.setValue(xOffset.current);
  })
  .onFinalize(()=>{
   setPinching(false);
   const finalZoom=clampZoom(nextZoom.current);
   lastZoom.current=finalZoom;
   xOffset.current=clampPanX(xOffset.current,finalZoom,width);
   translateX.setValue(xOffset.current);
   notifyZoom.current(finalZoom);
  }),[scale,translateX,width]);

 const pan=useMemo(()=>Gesture.Pan()
  .runOnJS(true)
  .minPointers(1).maxPointers(1)
  .activeOffsetX([-9,9]).failOffsetY([-14,14])
  .enabled(currentZoom>1)
  .onStart(()=>{
   panStartX.current=xOffset.current;
   setPanning(true);
  })
  .onUpdate(event=>{
   xOffset.current=clampPanX(panStartX.current+event.translationX,lastZoom.current,width);
   translateX.setValue(xOffset.current);
  })
  .onFinalize(()=>setPanning(false)),[currentZoom,translateX,width]);

 const gesture=useMemo(()=>Gesture.Simultaneous(pinch,pan),[pinch,pan]);
 const scaledHeight=Math.ceil(Math.max(1,contentHeight)*currentZoom);
 return <View style={s.viewport} onLayout={e=>{
   const measured=Math.round(e.nativeEvent.layout.width);
   if(measured>0&&measured!==viewportWidth)setViewportWidth(measured);
  }}>
  <ScrollView ref={scrollRef}
   scrollEnabled={!pinching&&!panning}
   nestedScrollEnabled
   showsVerticalScrollIndicator
   keyboardShouldPersistTaps="handled"
   bounces={false}
   style={s.viewport}
   contentContainerStyle={{minHeight:scaledHeight}}>
   <GestureDetector gesture={gesture}>
    <View collapsable={false} style={{width,height:scaledHeight,overflow:'hidden'}}>
     <Animated.View style={{
      width,
      transformOrigin:[0,0,0],
      transform:[{translateX},{scale}]
     }}>
      <View style={[s.content,{width}]} onLayout={event=>{
       const measured=Math.ceil(event.nativeEvent.layout.height);
       if(measured>0&&measured!==contentHeight)setContentHeight(measured);
      }}>
       {children}
      </View>
     </Animated.View>
    </View>
   </GestureDetector>
  </ScrollView>
 </View>;
}
const s=StyleSheet.create({
 viewport:{flex:1,overflow:'hidden'},
 content:{paddingHorizontal:12,paddingTop:7,paddingBottom:70}
});
