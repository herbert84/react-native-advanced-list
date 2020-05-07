import React, { Component } from 'react'
import {
    ScrollView,
    View,
    TouchableHighlight,
    StyleSheet,
    Platform
} from 'react-native'
import { isIphoneX } from './ScreenUtil';

import PropTypes from 'prop-types'

export default class AdvancedList extends Component {

    static propTypes = {
        leftList: PropTypes.shape({
            listHeader: PropTypes.func,
            sectionHeader: PropTypes.func,
            renderItem: PropTypes.func.isRequired,
            sections: PropTypes.array.isRequired,
        }).isRequired,
        rightList: PropTypes.shape({
            listHeader: PropTypes.func,
            sectionHeader: PropTypes.func,
            renderItem: PropTypes.func.isRequired,
            sections: PropTypes.array.isRequired,
            contentContainerWidth: PropTypes.number.isRequired,
        }).isRequired,
    }

    // static defaultProps = {
    //   leftList: {
    //     listHeader: () => <View />,
    //     sectionHeader: (section, sectionIndex) => <View />,
    //   },
    //   rightList: {
    //     listHeader: () => <View />,
    //     sectionHeader: (section, sectionIndex) => <View />,
    //   }
    // }

    constructor(props) {
        super(props)

        this.rightScrollViewOffsetX = 0
        this.rightScrollViewOffsetY = 0
        this.frozenScrollViewBeginDragging = false
        this.rightHeaderScrollViewBeginDragging = false
        //this.isScrolling = false
        //this.slideStart = false;

        this.state = {
            leftScrollView: null,
            rightScrollView: null,
            rightHeaderScrollView: null,

            leftStickyHeaderIndices: [],
            rightStickyHeaderIndices: [],

            leftSections: [],
            rightSections: [],

            leftListHeader: () => <View />,
            leftSectionHeader: (section, sectionIndex) => <View />,
            rightListHeader: () => <View />,
            rightSectionHeader: (section, sectionIndex) => <View />,
        }
    }

    componentDidMount () {
        if (this.props.leftList.listHeader !== undefined) {
            this.setState({ leftListHeader: this.props.leftList.listHeader })
        }
        if (this.props.leftList.sectionHeader !== undefined) {
            this.setState({ leftSectionHeader: this.props.leftList.sectionHeader })
        }
        if (this.props.rightList.listHeader !== undefined) {
            this.setState({ rightListHeader: this.props.rightList.listHeader })
        }
        if (this.props.rightList.sectionHeader !== undefined) {
            this.setState({ rightSectionHeader: this.props.rightList.sectionHeader })
        }

        this.setState({ leftSections: this.props.leftList.sections })
        this.setState({ rightSections: this.props.rightList.sections })

        this.setState({ leftStickyHeaderIndices: this._createStickyHeaderIndices(this.props.leftList.sections) })
        this.setState({ rightStickyHeaderIndices: this._createStickyHeaderIndices(this.props.rightList.sections) })

    }
    componentWillReceiveProps (nextProps) {
        if (JSON.stringify(this.props.leftSections) !== JSON.stringify(nextProps.leftList.sections)) {
            this.setState({ leftSections: nextProps.leftList.sections })
        }
        if (JSON.stringify(this.props.rightSections) !== JSON.stringify(nextProps.rightList.sections)) {
            this.setState({ rightSections: nextProps.rightList.sections })
        }
    }
    _createStickyHeaderIndices (sections) {
        var indices = []
        for (idx = 0; idx < sections.length; idx++) {
            idx === 0 ? indices.push(idx) : indices.push(indices[idx - 1] + sections[idx - 1].data.length + 1)
        }
        return indices
    }

    render () {
        return (
            <View
                key={'favView'}
                style={[styles.tableLeft, styles.tableRight, { flex: 1, flexDirection: 'row', justifyContent: 'flex-start' }]}>
                <View>
                    {this.state.leftListHeader()}
                    <ScrollView
                        bounces={false}
                        alwaysBounceVertical={false}
                        scrollEventThrottle={16}
                        key={'leftscrollview'}
                        ref={(ref) => this.state.leftScrollView = ref}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        stickyHeaderIndices={this.state.leftStickyHeaderIndices}
                        onScrollBeginDrag={() => this.frozenScrollViewBeginDragging = true}
                        onMomentumScrollEnd={() => {
                            //console.log("stoped");
                            //this.isScrolling = false;
                            //this.props.isScrolling && this.props.isScrolling(false)
                        }}
                        onScroll={(event) => {
                            if (this.frozenScrollViewBeginDragging) {
                                this.state.rightScrollView.scrollTo({ x: this.rightScrollViewOffsetX, y: event.nativeEvent.contentOffset.y, animated: false });
                            }
                        }}
                    >
                        {this.state.leftSections.map((section, sectionIndex) => {
                            var header = <TouchableHighlight key={sectionIndex}>
                                {this.state.leftSectionHeader(section, sectionIndex)}
                            </TouchableHighlight>
                            var items = section.data.map((item, itemIndex) =>
                                this.props.leftList.renderItem(section, sectionIndex, item, itemIndex)
                            )
                            // console.log("tempcomponents " + JSON.stringify([header, items]))
                            return [header, items]
                        }
                        )}
                    </ScrollView>
                </View>
                <View style={{ flex: 1 }}>
                    <ScrollView
                        key={'rightscrollviewcontainer'}
                        //bounces={false}
                        alwaysBounceVertical={false}
                        alwaysBounceHorizontal={true}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        scrollEventThrottle={16}
                        onScroll={(event) => {
                            //if (!this.isScrolling) {
                            //this.isScrolling = true;
                            //this.props.isScrolling && this.props.isScrolling(true)
                            //}
                        }}
                        onScrollEndDrag={() => {
                            /*setTimeout(() => {
                                if (!this.slideStart && this.isScrolling) {
                                    this.props.isScrolling && this.props.isScrolling(false)
                                }
                            }, 200)*/
                        }}
                        onMomentumScrollBegin={() => {
                            //this.slideStart = true;
                        }}
                        onMomentumScrollEnd={() => {
                            //console.log("stoped");
                            //this.slideStart = false;
                            //this.isScrolling = false;
                            //this.props.isScrolling && this.props.isScrolling(false)
                        }}
                    >
                        <View>
                            <View>
                                <ScrollView
                                    key={'rightheaderscrollview'}
                                    horizontal={true}
                                    //alwaysBounceHorizontal={false}
                                    scrollEventThrottle={16}
                                    showsHorizontalScrollIndicator={false}
                                    showsVerticalScrollIndicator={false}
                                    ref={(ref) => this.state.rightHeaderScrollView = ref}
                                    onScrollBeginDrag={() => this.rightHeaderScrollViewBeginDragging = true}
                                    onScroll={(event) => {
                                        if (this.rightHeaderScrollViewBeginDragging) {
                                            this.state.rightScrollView.scrollTo({ x: event.nativeEvent.contentOffset.x, y: this.rightScrollViewOffsetY, animated: false });
                                        }
                                    }}
                                >
                                    {
                                        this.state.rightListHeader()
                                    }
                                </ScrollView>
                            </View>
                            <ScrollView
                                bounces={false}
                                alwaysBounceVertical={false}
                                //alwaysBounceHorizontal={false}
                                directionalLockEnabled={true}
                                scrollEventThrottle={16}
                                key={'rightscrollview'}
                                ref={(ref) => this.state.rightScrollView = ref}
                                showsHorizontalScrollIndicator={false}
                                showsVerticalScrollIndicator={false}
                                stickyHeaderIndices={this.state.rightStickyHeaderIndices}
                                onScrollBeginDrag={() => {
                                    this.frozenScrollViewBeginDragging = false
                                    this.rightHeaderScrollViewBeginDragging = false
                                }}
                                onScrollEndDrag={() => {
                                    /*setTimeout(() => {
                                        if (!this.slideStart && this.isScrolling) {
                                            this.props.isScrolling && this.props.isScrolling(false)
                                        }
                                    }, 200)*/
                                }}
                                onMomentumScrollBegin={() => {
                                    //this.slideStart = true;
                                }}
                                onMomentumScrollEnd={() => {
                                    //this.slideStart = false;
                                    //this.isScrolling = false;
                                    //this.props.isScrolling && this.props.isScrolling(false)
                                }}
                                onScroll={(event) => {
                                    //console.log("scrolling");
                                    //if (!this.isScrolling) {
                                    //this.isScrolling = true;
                                    //this.props.isScrolling && this.props.isScrolling(true)
                                    //}
                                    if (!this.frozenScrollViewBeginDragging) {
                                        this.state.leftScrollView.scrollTo({ x: 0, y: event.nativeEvent.contentOffset.y, animated: false });
                                    }
                                    if (!this.rightHeaderScrollViewBeginDragging) {
                                        this.state.rightHeaderScrollView.scrollTo({ x: event.nativeEvent.contentOffset.x, y: 0, animated: false })
                                    }
                                    this.rightScrollViewOffsetX = event.nativeEvent.contentOffset.x;
                                    this.rightScrollViewOffsetY = event.nativeEvent.contentOffset.y;
                                }}
                                contentContainerStyle={{ minWidth: this.props.rightList.contentContainerWidth }}>
                                {
                                    this.state.rightSections.map((section, sectionIndex) => {
                                        var header = <TouchableHighlight key={sectionIndex}>
                                            {this.state.rightSectionHeader(section, sectionIndex)}
                                        </TouchableHighlight>
                                        var items = section.data.map((item, itemIndex) =>
                                            this.props.rightList.renderItem(section, sectionIndex, item, itemIndex)
                                        )
                                        return [header, items]
                                    }
                                    )
                                }
                            </ScrollView>
                        </View>
                    </ScrollView>
                </View>
            </View>
        )
    }
}
const styles = StyleSheet.create(
    {
        tableLeft: {
            marginLeft: Platform.OS === "ios" ? (isIphoneX() ? 34 : 0) : 0
        },
        tableRight: {
            marginRight: Platform.OS === "ios" ? (isIphoneX() ? 34 : 0) : 0
        }
    }
);
