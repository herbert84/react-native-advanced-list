import React from "react";
import { AdvancedList } from "react-native-advanced-list";
import { View, Text, Modal, Dimensions, StyleSheet, TouchableHighlight, Image, Platform, NativeModules, DeviceInfo, TouchableWithoutFeedback } from "react-native";
import Orientation from "react-native-orientation";
import ActionButton from "react-native-action-button";
import TextSize from "react-native-text-size";
import { cloneDeep, sortBy, maxBy, forEach, meanBy, toInteger, round, isEqual, filter } from "lodash";
import { isIphoneX } from './ScreenUtil';

const { width: screenWidth, height: screenHeight } = Dimensions.get("screen");

export default class AdvancedColorList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,
            rowHeight: 55,
            showFloatButton: true,
            rightHeader: [],
            leftHeader: [],
            data: [],
            sortKey: "",
            sortType: "",
            headerAlignCenter: false,
            availableWidth: 0
        };
    }
    componentDidMount() {
        this.calculateColumns();
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.isVisible && !this.props.isVisible) {
            this.initialData();
        }
    }

    renderHeader(isLeft) {
        const { leftHeader, rightHeader } = this.state;
        const renderItems = isLeft ? leftHeader : rightHeader;
        return <View key={this.randomStringId(10)} style={[styles.headerBar, styles.rowAndCenterLayout, isLeft ? styles.rowAndLeftPadding : {}]}>
            {renderItems.map((item) => (
                item.sortable ? this.renderSortableColumn(item) : this.renderFixedColumn(item)
            ))}
        </View>;
    }

    renderSubHeader(isLeft) {
        const { leftHeader, rightHeader, rowHeight: height } = this.state;
        const renderItems = isLeft ? leftHeader : rightHeader;
        return <View style={[styles.subHeaderBar, styles.rowAndCenterLayout]}>
            {
                renderItems.map(({ subLabel, width, textAlign }) => {
                    return <View key={this.randomStringId(10)} style={styles.rowAndRightPadding}>
                        {isLeft ? <View style={[styles.rowAndLeftPadding, styles.rowAndCenterLayout, { height }]}>
                            <Text style={styles.subHeaderText}>{subLabel}</Text>
                        </View> : <Text style={[styles.subHeaderText, { width, textAlign }]} >{subLabel}</Text>}
                    </View>;
                })
            }
        </View >;
    }

    renderSortableColumn(item) {
        const { headerAlignCenter, sortType, sortKey } = this.state;
        const { rowAndRightPadding, headerText, headerUnitText, sortIcon } = styles;

        return <TouchableWithoutFeedback key={this.randomStringId(10)} onPress={() => this.sortColumnData(item.colId)} activeOpacity={0.8}>
            <View style={{ width: item.width + 18, height: 40, flexDirection: "column", justifyContent: "center" }}>
                <View style={rowAndRightPadding}>
                    <View style={styles.columnAndEndLayout}>
                        <Text
                            style={[headerText, { width: item.width - 13, marginLeft: 0, marginRight: 6 }]}>
                            {item.label}
                        </Text>
                        {!headerAlignCenter ? <Text
                            style={[headerUnitText, { marginLeft: 0, marginRight: 6 }]}>
                            {item.unit}
                        </Text> : null}
                    </View>
                    {(sortType === "desc" && sortKey === item.colId) ? <Image source={require("../img/order_descending.png")} style={sortIcon} /> :
                        (sortType === "asc" && sortKey === item.colId ? <Image source={require("../img/order_ascending.png")} style={sortIcon} /> :
                            <Image source={require("../img/order_default.png")} style={sortIcon} />)}
                </View>
            </View>
        </TouchableWithoutFeedback>;
    }
    renderFixedColumn(item) {
        return <View style={styles.rowAndRightPadding} key={this.randomStringId(10)}>
            <View style={styles.columnAndEndLayout}>
                <Text
                    style={[styles.headerText, { width: item.width, marginLeft: 0, marginRight: 0, textAlign: item.textAlign }]}>
                    {item.label}
                </Text>
                {item.unit ? <Text
                    style={[styles.headerUnitText, { marginLeft: 0, marginRight: 0 }]}>
                    {item.unit}
                </Text> : null}
            </View>
        </View>;
    }

    _favLeftView(player, idx) {
        const { leftHeader, rowHeight: height } = this.state;
        let backgroundColor = idx % 2 === 0 ? "#FFFFFF" : "#F9FAFB";
        let rowItems = [];
        forEach(leftHeader, (item) => {
            const { colId, textAlign, width } = item;
            rowItems.push(<View key={this.randomStringId(10)} style={styles.rowAndRightPadding}>
                <Text style={[styles.text, { width, textAlign }]}>{player[colId].toString()}</Text>
            </View>);
        });

        return <TouchableHighlight
            key={this.randomStringId(10)}>
            <View style={[styles.rowAndLeftPadding, styles.rowAndCenterLayout, { height, backgroundColor }]}>
                {rowItems}
            </View>
        </TouchableHighlight>;
    }

    _favRightView(player, idx) {
        const { rightHeader, rowHeight: height } = this.state;
        const rowItems = [];
        forEach(rightHeader, (item) => {
            const { colId, textAlign, width, subLabel, maxValue, unit } = item;
            const currentValue = parseFloat(player[colId], 10);
            const isExcept = isEqual(unit.toLocaleUpperCase(), "MINS");
            const isBigger = currentValue > subLabel;
            const isMax = currentValue === maxValue;
            const colorStyle = isExcept ? [] : [isBigger ? styles.yellowMark : {}, isMax ? styles.greenMark : {}];
            rowItems.push(<View key={this.randomStringId(10)} style={[styles.rowAndRightPadding, ...colorStyle]}>
                <Text style={[styles.text, { width, textAlign }]} >{player[colId]}</Text>
            </View>);
        });
        return <TouchableHighlight
            key={this.randomStringId(10)}>
            <View
                style={[styles.rowAndCenterLayout, { height }]}>
                {rowItems}
            </View>
        </TouchableHighlight>;
    }

    renderFloatButton() {
        let marginRight = Platform.OS === "ios" ? (isIphoneX() ? 58 : 24) : 24;
        return this.state.showFloatButton ? <ActionButton
            onPress={() => this.hideTable()}
            buttonColor={"rgba(0, 0, 0, 0)"}
            offsetX={marginRight}
            hideShadow={true}
            size={60}
            renderIcon={() => {
                return <Image source={require("../img/test_result_back.png")} style={{ height: 60, width: 60 }} />;
            }} /> : null;
    }

    render() {
        const { props: { isVisible }, state: { data: { players: data } } } = this;
        return <Modal
            animationType="fade"
            transparent={false}
            supportedOrientations={["landscape-right", "landscape-left", "portrait"]}
            visible={isVisible}
            hideModalContentWhileAnimating={true}
            deviceWidth={screenHeight}
            deviceHeight={screenWidth}
            onRequestClose={() => {
                this.hideTable();
            }}
        >
            <AdvancedList
                leftList={{
                    listHeader: () => this.renderHeader(true),
                    sectionHeader: () => this.renderSubHeader(true),
                    renderItem: (section, sectionIndex, item, itemIndex) => {
                        return this._favLeftView(item, itemIndex);
                    },
                    sections: [
                        { data }
                    ]
                }}
                rightList={{
                    listHeader: () => this.renderHeader(false),
                    sectionHeader: () => this.renderSubHeader(false),
                    renderItem: (section, sectionIndex, item, itemIndex) => {
                        return this._favRightView(item, itemIndex);
                    },
                    sections: [
                        { data }
                    ],
                    contentContainerWidth: 100
                }}
            />
            {this.renderFloatButton()}
        </Modal>;
    }

    setModalVisible(visible) {
        this.setState({ modalVisible: visible });
    }

    showTable() {
        this.setModalVisible(true);
        setTimeout(() => {
            if (Platform.OS === "ios") { Orientation.lockToLandscapeRight(); }
            else { Orientation.lockToLandscapeLeft(); }
        }, 200);
    }
    hideTable() {
        this.props.hideTable && this.props.hideTable();
        Orientation.getOrientation(() => {
            Orientation.lockToPortrait();
        });
    }

    // showHideFloatButton(isScrolling) {
    //     this.setState({
    //         showFloatButton: !isScrolling
    //     });
    // }

    calculateColumns() {
        const { data, locale } = this.props;

        let columns = [];
        let leftHeader = [];

        let playerData = cloneDeep(data.rowsTable);
        let findHasUnit = false;

        forEach(data.cols, (item) => {
            if (item) {
                const { isFixed, colId, name: label, isSortable: sortable, unit } = item;
                const commonProps = {
                    colId,
                    label,
                    sortable,
                    width: 100
                };
                if (isFixed) {
                    leftHeader.push({
                        ...commonProps,
                        subLabel: locale.indexOf("zh") > -1 ? "球队平均" : "Team Average",
                        textAlign: "left",
                        isFixed: true
                    });
                } else {
                    if (unit) {
                        findHasUnit = true;
                    }
                    let maxLengthValue = maxBy(playerData, (playerItem) => {
                        return playerItem[colId] ? playerItem[colId].length : 0;
                    });
                    let meanValue = meanBy(filter(playerData, (playerItem) => toInteger(playerItem[colId]) !== 0), (playerItem) => {
                        return toInteger(playerItem[colId]);
                    });
                    let maxValue = maxBy(playerData, (playerItem) => {
                        return toInteger(playerItem[colId]);
                    });
                    columns.push({
                        ...commonProps,
                        unit,
                        textAlign: sortable ? "right" : "left",
                        subLabel: round(meanValue),
                        maxValue: toInteger(maxValue[colId]),
                        maxLengthValue: maxLengthValue[colId] ? maxLengthValue[colId] : "0"
                    });
                }
            }
        });

        let newList = sortBy(playerData, function (o) {
            return parseInt(o.SHIRT_NUMBER, 10);
        });
        this.setState({
            headerAlignCenter: !findHasUnit,
            data: { players: newList },
            rightHeader: columns,
            leftHeader
        }, () => this.measureTextSize());
    }

    initialData() {
        let newList = sortBy(this.state.data.players, function (o) {
            return parseInt(o.SHIRT_NUMBER, 10);
        });
        this.setState({
            data: { players: newList },
            sortKey: "",
            sortType: ""
        });
    }

    measureTextSize() {
        let promiseList = [];
        const { leftHeader, rightHeader, data: { players } } = this.state;
        forEach(leftHeader, ({ colId, label }) => {
            promiseList.push(new Promise((resolve, reject) => {
                var longestValue = maxBy(players, (playerItem) => {
                    return playerItem[colId].length;
                });
                TextSize.measure({
                    text: longestValue[colId].length > label.length ? longestValue[colId] : label,
                    fontFamily: undefined,
                    fontSize: 16
                }).then((size) => resolve(size)).catch((err) => reject(err));
            }));
        });
        //get longest width for each label on right header side
        forEach(rightHeader, ({ label, maxLengthValue }) => {
            //计算右边滑动列头部标签的宽度
            promiseList.push(new Promise((resolve, reject) => {
                TextSize.measure({
                    text: label,
                    fontFamily: undefined,
                    fontSize: 12
                }).then((size) => resolve(size)).catch((err) => reject(err));
            }));
            //计算右边滑动列数据字段最大值的宽度
            promiseList.push(new Promise((resolve, reject) => {
                TextSize.measure({
                    text: maxLengthValue,
                    fontFamily: undefined,
                    fontSize: 16,
                    fontWeight: "bold"
                }).then((size) => resolve(size)).catch((err) => reject(err));
            }));
        });

        Promise.all(promiseList).then((values) => {
            let newRightHeader = [];
            let newLeftHeader = [];

            //计算左边滑动列的每列最大宽度，
            forEach(leftHeader, (item, index) => {
                let column = {
                    ...item,
                    textAlign: item.textAlign ?? "left",
                    width: values[index].width + 13
                };
                newLeftHeader.push(column);
            });


            let valuesIndex = leftHeader.length - 1;
            //计算右边滑动列的每列最大宽度，
            forEach(rightHeader, (item) => {
                const valueOne = values[valuesIndex + 1];
                const valueTwo = values[valuesIndex + 2];
                let column = {
                    ...item,
                    textAlign: item.textAlign ?? "left",
                    width: valueOne.width + 13 > valueTwo.width ? valueOne.width + 15 : valueTwo.width + 10
                };
                valuesIndex = valuesIndex + 2;
                newRightHeader.push(column);
            });

            let marginLeft = Platform.OS === "ios" ? (isIphoneX() ? 34 : 0) : 0;
            let marginRight = Platform.OS === "ios" ? (isIphoneX() ? 34 : 0) : 0;
            let horizontalScreenWidth = screenHeight > screenWidth ? screenHeight : screenWidth;
            let tableWidth = horizontalScreenWidth - marginLeft - marginRight - 18 - 18;
            let availableWidth = tableWidth - 100;
            forEach(newRightHeader, (item) => {
                if (item.colId !== "COMMENT") {
                    availableWidth -= item.width + 18;
                } else {
                    item.width = availableWidth > item.width ? availableWidth : item.width;
                }
            });
            this.setState({
                rightHeader: newRightHeader,
                leftHeader: newLeftHeader
            });
        }).catch((err) => {
            console.log(err);
        });
    }

    sortColumnData(colId) {
        let sortType = "desc";
        let sortKey = colId;
        if (this.state.sortKey === colId) {
            sortType = this.state.sortType === "desc" ? "asc" : "";
            sortKey = this.state.sortType === "desc" ? colId : "";
            this.setState({
                sortKey,
                sortType
            });
        } else {
            this.setState({
                sortKey: colId,
                sortType: "desc"
            });
        }
        let newList = sortBy(this.state.data.players, function (o) {
            return (sortKey === "") ? parseInt(o.SHIRT_NUMBER, 10) : (sortType === "asc") ? parseFloat(o[colId], 10) : -parseFloat(o[colId], 10);
        });
        this.setState({
            data: { players: newList }
        });
    }

    randomStringId(n) {
        let str = "abcdefghijklmnopqrstuvwxyz9876543210";
        let tmp = "",
            i = 0,
            l = str.length;
        for (i = 0; i < n; i++) {
            tmp += str.charAt(Math.floor(Math.random() * l));
        }
        return tmp;
    }
}

const styles = StyleSheet.create(
    {
        //common
        rowAndCenterLayout: {
            flexDirection: "row",
            alignItems: "center"
        },
        columnAndEndLayout: {
            flexDirection: "column",
            alignItems: "flex-end"
        },
        rowAndRightPadding: {
            flexDirection: "row",
            paddingRight: 18
        },
        rowAndLeftPadding: {
            flexDirection: "row",
            paddingLeft: 18
        },
        // custom
        headerBar: {
            backgroundColor: "#F6F7F8",
            height: 40
        },
        subHeaderBar: {
            backgroundColor: "#eaf1ff",
            height: 40
        },
        sortIcon: {
            width: 7,
            height: 14
        },
        text: {
            fontSize: 16,
            width: 100,
            textAlign: "right",
            color: "#232426",
            fontWeight: "bold",
            lineHeight: 55
        },
        subHeaderText: {
            fontSize: 12,
            textAlign: "right",
            color: "#154DC5",
            fontWeight: "bold"
        },
        headerUnitText: {
            fontSize: 8,
            lineHeight: 14,
            color: "#9F9F9F",
            textAlign: "right"
        },
        headerText: {
            width: 100,
            fontSize: 12,
            color: "#595B5F",
            textAlign: "right"
        },
        sectionView: {
            height: 30,
            justifyContent: "center",
            backgroundColor: "#F8F9F8"
        },
        actionButtonIcon: {
            fontSize: 20,
            height: 22,
            color: "white",
        },
        yellowMark: {
            backgroundColor: "#FFE0B2"
        },
        greenMark: {
            backgroundColor: "#2DBF68"
        }
    }
);

