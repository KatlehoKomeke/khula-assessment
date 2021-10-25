// Importing all the necessary packages.
import MapView , { PROVIDER_GOOGLE } from 'react-native-maps';
import React, {Component}from 'react';
import {Button,Dimensions, FlatList ,Image , Keyboard,KeyboardAvoidingView,Platform,SafeAreaView,ScrollView,StyleSheet,Text,TextInput,TouchableOpacity,TouchableWithoutFeedback,View} from 'react-native';
import MapViewDirections from 'react-native-maps-directions';

export default class App extends Component {

  // Initialising the state.
  constructor(props)
  {
    super(props)
    this.state = {
      data : [],
      dataByName: [],
      page : 1,
      isLoading: false,
      origin : {latitude: 37.771707, longitude: -122.4053769},
      destination : {latitude: 40.7127837, longitude: -74.0059413},
      coordinates: [{latitude: 40.7127837,longitude: -74.0059413},{latitude: 37.771707,longitude: -122.4053769}],
      hiddenErrorMessageStlye: {width: 0, height: 0, backgroundColor:'rgba(30,30,30,0)'},
      ScrollAreaViewHeight1: Dimensions.get('window').height/200*104,
      ScrollAreaViewHeight2: 0,
      zindex: 0,
      opacity1: 1,
      opacity2: 0
    }
  }

  // Once everything has mounted call the getData function.
  componentDidMount(){
    this.setState({isLoading:true},this.getData)
  }

  // This function is lazy load optimised and gets data from the database in chunks.
  getData =  async() => {
    this.setState({page: this.state.page + 1});
    // Please note that it is advised that the LAN be used here.
    // I used localhost for example purposes.
    const apiURL = "http://localhost:5000/"+ this.state.page;
    fetch(apiURL).then((response) => response.json()).then((json) =>
      {
        if(json[0].length > 0)
        {
          // Updating state.
          this.setState({
            data: this.state.data.concat(json),
            isLoading: false
          })
        }
      }
    )
  }

  // This function uses the input given to find the corresponding names in the database.
  findByName = async(name) => {
    if(name == "")
    {
      // Updating state.
      this.setState({
        dataByName: [],
        ScrollAreaViewHeight1: Dimensions.get('window').height/200*104,
        ScrollAreaViewHeight2 : 0,
        zindex: 0,
        opacity1: 1,
        opacity2: 0
      })
    }else
    {
      // Please note that it is advised that the LAN be used here.
      // I used localhost for example purposes.
      const apiURL = "http://localhost:5000/school/name/"+ name;

      // Update the state which.
      fetch(apiURL).then((response) => response.json()).then((json) =>
        {
          // Updating state.
          this.setState({
            ScrollAreaViewHeight1 : 0,
            ScrollAreaViewHeight2 : Dimensions.get('window').height/200*104,
            zindex: 99,
            dataByName: json[0],
            opacity1: 0,
            opacity2: 1
          });
        }
      )
    }
  }

  // Setting the map directions.
  getDirections = async(latitude,longitude) => {
    // Updating state.
    this.setState({destination:{latitude: parseFloat(latitude), longitude: parseFloat(longitude)}});
    this.setState({coordinates:[{latitude: parseFloat(latitude),longitude: parseFloat(longitude)},{latitude: 37.771707,longitude: -122.4053769}]});
  }

  // Rendering 2 objects at a time dynamically.
  renderRow = ({item}) =>{
    if(item.length == 2)
    {
      return(
        <View>
          <TouchableOpacity onLongPress={() => this.getDirections(item[0].Latitude,item[0].Longitude)}>
            <Image source={{uri: item[0].ImageLink}} style={styles.itemImage}/>
            <Text style={styles.itemText}>{item[0].Name}</Text>
          </TouchableOpacity>

          <TouchableOpacity onLongPress={() => this.getDirections(item[1].Latitude,item[1].Longitude)}>
            <Image source={{uri: item[1].ImageLink}} style={styles.itemImage}/>
            <Text style={styles.itemText}>{item[1].Name}</Text>
          </TouchableOpacity>
        </View>
      )
    }
  }

  // Updating the state lazily upon scrolling.
  handleLoadMore = () =>{
    // Updating state.
    this.setState({isLoading:true},this.getData)
  }

  // Error handling for when a coordinate cannot be mapped.
  zeroResults = (error) =>
  {
    // Updating state.
    if(error == "Error on GMAPS route request: ZERO_RESULTS")
    {
      this.setState({hiddenErrorMessageStlye:{position: 'absolute', borderRadius: 30,width: Dimensions.get('window').width,height: Dimensions.get('window').height/11*4, backgroundColor:'rgba(30,30,30,0.5)', textAlign: 'center', zindex:9999}})
    }else
    {
      this.setState({hiddenErrorMessageStlye:{width: 0, height: 0, backgroundColor:'rgba(30,30,30,0)'}})
    }
  }

  render(){
    return(
      // Map is on top so there is no need for <SafeAreaView> to be at the very top.
      // Used KeyboardAvoidingView to make the user experience better when inputting text.
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex:1}}>
        <View style={{flex: 1}}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <>
              <View style={styles.map}>
                <MapView style={styles.map} 
                // Placing the marker on top of the screen.
                        initialRegion =
                        {{
                          latitude:  39.50,
                          longitude: -98.35,
                          latitudeDelta: LATITUDE_DELTA,
                          longitudeDelta: LONGITUDE_DELTA,
                        }}
                        provider={PROVIDER_GOOGLE}
                >
                  {this.state.coordinates.map((coordinate, index) =>
                    // Placing markers on the map.
                    <MapView.Marker key={`coordinate_${index}`} coordinate={coordinate} pinColor={'rgba(30,30,30,1)'}/>
                  )}
                  <MapViewDirections
                    // Connecting the markers with a direction.
                    lineDashPattern={[0]}
                    origin={this.state.origin}
                    destination={this.state.destination}
                    apikey={'AIzaSyBfBbh5yHLnSm47JRjB-cVdolKVGMoMyuc'}
                    strokeColor="rgba(30,30,30,0.3)"
                    strokeWidth={7}
                    optimizeWaypoints={true}
                    ref={(value) => this.state.mapView = value}
                    onError={this.zeroResults}
                  />
                </MapView> 
              </View>
              <SafeAreaView style={this.state.hiddenErrorMessageStlye}>
                  <Button stlye={{width:'80%',backgroundColor:'rbga(30,30,30,0.3)'}}color="#fff" onPress={this.zeroResults} title={'This message pops up everytime a direction cannot be given. The error only happens when your origin point cannot be matched up with your destination by google maps. To remove this message click on the text and pick a school that is in reach. 🤍'}></Button>
              </SafeAreaView>
              <ScrollView style={{height: this.state.ScrollAreaViewHeight1, opacity: this.state.opacity1}}>
                <FlatList
                  // This section lazily loads and displays incoming data from the database.
                  horizontal data={this.state.data} renderItem={this.renderRow} keyExtractor={(item,index) => index.toString()} onEndReached={this.handleLoadMore} 
                />
              </ScrollView>
              <ScrollView horizontal style={{height: this.state.ScrollAreaViewHeight2, zindex:this.state.zindex,opacity:this.state.opacity2}}>
                {
                  // This section gets all the search related responses and displays them on the screen individually.
                  this.state.dataByName.map((arguement,index)=>(
                    <View key={index}>
                      <View>
                      <TouchableOpacity onLongPress={() => this.getDirections(arguement.Latitude,arguement.Longitude)}>
                        <Image source={{uri: arguement.ImageLink}} style={styles.itemImage}/>
                      </TouchableOpacity>
                      </View>
                      <View >
                        {/* Additional information is being displayed in for the search result. */}
                      <TouchableOpacity onLongPress={() => this.getDirections(arguement.Latitude,arguement.Longitude)}>
                        <Text style={styles.itemText}>{arguement.Id}</Text>
                        <Text style={styles.itemText}>{arguement.Name}</Text>
                        <Text style={styles.itemText}>{arguement.Address}</Text>
                        <Text style={styles.itemText}>{arguement.Latitude}</Text>
                        <Text style={styles.itemText}>{arguement.Longitude}</Text>
                        <Text style={styles.itemText}>{arguement.ImageLink}</Text>
                      </TouchableOpacity>
                      </View>
                    </View>
                  ))
                }
              </ScrollView>
              <ScrollView vertical>
                <View style={styles.itemRow}>
                  {/* This TextInput captures the user's searches. */}
                  <TextInput placeholder="find by name" onChangeText={this.findByName} style={{textAlign: 'center', color: 'rgba(30,30,30,0.2)', fontSize: 24}}/>
                </View>
              </ScrollView>
              {/* Set added View for the KeyboardAvoidingView component's padding to be better. */}
              <View style={{ flex : 1 }} />
            </>
          </TouchableWithoutFeedback>
        </View>
      </KeyboardAvoidingView>
    )
  }
}

// Initialising crucial map data.
const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 35;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// Setting the stylesheet for a number of react native components.
const styles = StyleSheet.create({
  itemRow: {
    marginTop: Dimensions.get('window').height/50,
    width: '80%',
    marginLeft: '10%',
    height: Dimensions.get('window').height/19,
    borderRadius: 20,
    borderBottomColor: 'rgba(30,30,30,0.2)',
    borderBottomWidth: 1,
    flex:1
  },
  itemText:{
    width: '80%',
    fontSize: 16,
    padding:5,
    fontWeight: "bold",
    marginLeft: Dimensions.get('window').height/20,
    color: 'rgba(30,30,30,0.2)'
  },
  itemImage:{
    marginTop: Dimensions.get('window').height/50,
    marginLeft: Dimensions.get('window').height/25,
    width: Dimensions.get('window').height/5,
    height: Dimensions.get('window').height/5,
    resizeMode: 'cover',
    borderRadius: 24
  },
  loader:{
    marginTop: '50%',
    alignItems: 'center'
  },
  map: {
    borderRadius: 30,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height/11*4
  }
});