/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

import * as d3 from "d3";
import {getChartContainer} from "../../plugin/root";
import {enforceContainerBoundaries, margin} from "./enforceContainerBoundaries";

const resizeForDraggingEvent = "resize.for-dragging";

export function draggableComponent() {
    let pinned = true;

    const draggable = element => {
        const node = element.node();
        node.style.cursor = "move";

        const drag = d3.drag().on("drag", function() {
            const [offsetX, offsetY] = enforceContainerBoundaries(this, d3.event.dx, d3.event.dy);
            this.style.left = `${this.offsetLeft + offsetX}px`;
            this.style.top = `${this.offsetTop + offsetY}px`;

            const element = d3.select(this);
            if (isNodeInTopRight(node)) {
                pinned = pinNodeToTopRight(node);
                return;
            }

            pinned = unpinNodeFromTopRight(node, element, pinned);
        });

        element.call(drag);
    };

    return draggable;
}

function unpinNodeFromTopRight(node, element, pinned) {
    if (pinned !== false) {
        // Default behaviour for the legend is to remain pinned to the top right hand corner with a specific margin.
        // Once the legend has moved we cannot continue to use that css based approach.
        d3.select(window).on(resizeForDraggingEvent, function() {
            const [offsetX, offsetY] = enforceContainerBoundaries(node, 0, 0);
            node.style.left = `${node.offsetLeft + offsetX}px`;
            node.style.top = `${node.offsetTop + offsetY}px`;
        });
    }
    return false;
}

function pinNodeToTopRight(node) {
    d3.select(window).on(resizeForDraggingEvent, null);
    node.style.left = "auto";
    return true;
}

function isNodeInTopRight(node) {
    const nodeRect = node.getBoundingClientRect();
    const containerRect = d3
        .select(getChartContainer(node))
        .node()
        .getBoundingClientRect();

    const fuzz = 5;

    return nodeRect.right + margin + fuzz >= containerRect.right && nodeRect.top - margin - fuzz <= containerRect.top;
}
