import './page-selector.scss'

import * as React from 'react'
import * as PropTypes from 'prop-types'
import * as _ from 'lodash'

const ELLIPSIS = '. . .'
const L_ARROW = '<'
const R_ARROW = '>'

// page block subcomponent

interface BlockProps {
  onPage: boolean
  inner: string
  action? (): any
}

const blockPropTypes = {
  onPage:   PropTypes.bool.isRequired,
  inner:    PropTypes.string.isRequired,
  action:   PropTypes.func
}

const getBlockClass = (props: BlockProps) => {
  if (props.onPage) return 'on-page-block'
  if (!props.action) return 'no-action-block'
  return 'page-block'
}

const getArrowClass = (props: BlockProps) => {
  const arrowClass = props.inner === L_ARROW ? 'left-arrow' : 'right-arrow'
  const activeClass = props.action ? ' active-arrow' : ''
  return arrowClass + activeClass
}

const getInner = (props: BlockProps) => {
  const {inner} = props
  if (inner === L_ARROW || inner === R_ARROW) return (<div className={getArrowClass(props)}/>)
  return (<span>{inner}</span>)
}

const Block: React.StatelessComponent<BlockProps> = (props: BlockProps) => {
  const blockClass = getBlockClass(props)
  return (
    <div className={blockClass} onClick={props.action}>
      {getInner(props)}
    </div>
  )
}
Block.propTypes = blockPropTypes

// page selector main component

export interface PageSelectorProps {
  page: number
  totalPages: number
  action (page: number): any
}

export const pageSelectorPropTypes = {
  page:         PropTypes.number.isRequired,
  totalPages:   PropTypes.number.isRequired,
  action:       PropTypes.func.isRequired
}

//TODO expand this to allow for custom # of blocks (default=7)
const getPageList = (page: number, totalPages: number) => {
  if (totalPages < 8) {
    // show all page blocks if they fit (max 7)
    return _.range(1, totalPages + 1)
  } else {
    if (page < 5) {
      // if we're within the first 4 pages, show [1,2,3,4,5,...,last]
      // let `undefined` represent '...' blocks
      return _.range(1, 6).concat(
        [undefined, totalPages]
      )
    } else if (page > (totalPages - 4)) {
      // opposite of above
      return [1, undefined].concat(
        _.range(totalPages - 4, totalPages + 1)
      )
    }
    // in the middle, so [1. ..., -1, page, +1, ..., last]
    return [1, undefined].concat(
      _.range(page - 1, page + 2).concat(
        [undefined, totalPages]
      )
    )
  }
}

const getMiddleBlocks = (props: PageSelectorProps) => {
  const {page, totalPages, action} = props
  return _.map(
    getPageList(page, totalPages),
    (page: number) => {
      const blockProps = {
        onPage: page === props.page,
        inner: page ? page.toString() : ELLIPSIS,
        action: (page !== props.page && page) ? () => action(page) : undefined
      }
      return <Block {...blockProps}/>
    }
  )
}

const addArrows = (blocks: any, props: PageSelectorProps) => {
  const { page, totalPages, action } = props
  const leftArrowProps = {
    onPage: false,
    inner: L_ARROW,
    action: (page === 1) ? undefined : () => action(page - 1)
  }
  const rightArrowProps = {
    onPage: false,
    inner: R_ARROW,
    action: (page === totalPages) ? undefined : () => action(page + 1)
  }
  return (
    <div className='page-selector'>
      <Block {...leftArrowProps}/>
      {blocks}
      <Block {...rightArrowProps}/>
    </div>
  )
}

export const PageSelector: React.StatelessComponent<PageSelectorProps> = (props: PageSelectorProps) => {
  return addArrows(getMiddleBlocks(props), props)
}
PageSelector.propTypes = pageSelectorPropTypes
