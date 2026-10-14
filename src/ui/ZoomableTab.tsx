import React,{useEffect,useMemo,useRef,useState} from 'react';
import {Animated,ScrollView,StyleSheet,View,useWindowDimensions} from 'react-native';
import {Gesture,GestureDetector} from 'react-native-gesture-handler';
import {clampZoom} from '../tabZoom';

type Props={
 zoom:number;onZoomChange:(next:number)=>void;
 scrollRef?:React.RefObject<ScrollView|null>;
 children:React.ReactNode;
};

/**
 * Pellizco en la superficie de una pestaña. La navegación superior queda fija.
 * Dos ejes desplazables tras ampliar: vertical para leer; horizontal para
 * recorrer el tablero. La altura y ancho escalados mantienen la zona de scroll.
 * La transformación transitoria es Animated (no actualiza toda la app por frame).
 */
export default function ZoomableTab({zoom,onZoomChange,scrollRef,children}:Props){
 const {width:windowWidth}=useWindowDimensions();
 const [viewportWidth,setViewportWidth]=useState(windowWidth);
 const [contentHeight,setContentHeight]=useState(0);
 const [pinching,setPinching]=useState(false);
 const nativeZoom=useRef(new Animated.Value(clampZoom(zoom))).current;
 const lastZoom=useRef(clampZoom(zoom));
 const pinchBase=useRef(clampZoom(zoom));
 const nextZoom=useRef(clampZoom(zoom));
 const zoomChange=useRef(onZoomChange);
 const horizontal=useRef<ScrollView>(null);

 useEffect(()=>{zoomChange.current=onZoomChange},[onZoomChange]);
 useEffect(()=>{
  lastZoom.current=clampZoom(zoom);
  pinchBase.current=lastZoom.current;
  nextZoom.current=lastZoom.current;
  nativeZoom.setValue(lastZoom.current);
  if(zoom<=1.001)horizontal.current?.scrollTo({x:0,animated:false});
 },[zoom,nativeZoom]);

 const pinch=useMemo(()=>Gesture.Pinch()
  .runOnJS(true)
  .onStart(()=>{
   pinchBase.current=lastZoom.current;
   nextZoom.current=lastZoom.current;
   setPinching(true);
  })
  .onUpdate(event=>{
   const value=clampZoom(pinchBase.current*event.scale);
   nextZoom.current=value;
   nativeZoom.setValue(value);
  })
  .onFinalize(()=>{
   setPinching(false);
   const final=clampZoom(nextZoom.current);
   lastZoom.current=final;
   zoomChange.current(final);
   if(final<=1)horizontal.current?.scrollTo({x:0,animated:false});
  }),[nativeZoom]);

 const naturalWidth=Math.max(1,viewportWidth);
 const extendedWidth=Math.ceil(naturalWidth*zoom);
 const extendedHeight=Math.ceil(Math.max(1,contentHeight)*zoom);
 return <View style={s.viewport} onLayout={e=>{
   const measured=Math.round(e.nativeEvent.layout.width);
   if(measured>0&&measured!==viewportWidth)setViewportWidth(measured);
  }}>
  <ScrollView ref={horizontal} horizontal
   scrollEnabled={zoom>1&&!pinching}
   nestedScrollEnabled bounces={false} showsHorizontalScrollIndicator={zoom>1}
   style={s.viewport} contentContainerStyle={{minWidth:naturalWidth}}>
   <ScrollView ref={scrollRef}
    scrollEnabled={!pinching} nestedScrollEnabled
    showsVerticalScrollIndicator={true} bounces={false}
    keyboardShouldPersistTaps="handled"
    style={{width:extendedWidth,flex:1}}
    contentContainerStyle={{minHeight:extendedHeight}}>
    <GestureDetector gesture={pinch}>
     <View collapsable={false} style={{width:extendedWidth,height:extendedHeight}}>
      <Animated.View style={{
       width:naturalWidth,
       transformOrigin:[0,0,0],
       transform:[{scale:nativeZoom}]
      }}>
       <View style={[s.content,{width:naturalWidth}]} onLayout={e=>{
        const height=Math.ceil(e.nativeEvent.layout.height);
        if(height>0&&height!==contentHeight)setContentHeight(height);
       }}>
        {children}
       </View>
      </Animated.View>
     </View>
    </GestureDetector>
   </ScrollView>
  </ScrollView>
 </View>;
}
const s=StyleSheet.create({
 viewport:{flex:1,overflow:'hidden'},
 content:{paddingHorizontal:12,paddingTop:7,paddingBottom:70}
});
